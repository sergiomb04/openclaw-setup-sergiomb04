#!/usr/bin/env node
console.log("GCM running...");
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import dotenv from 'dotenv';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

dotenv.config();

const MAX_DIFF_CHARS = 14000;
const MODEL = 'llama3.1-8b';

function exitWithError(message) {
  console.error(chalk.red('Error:'), message);
  process.exit(1);
}

function runGit(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...options }).trim();
  } catch (error) {
    throw new Error(error.stderr?.toString() || error.message || String(error));
  }
}

function ensureGitRepo() {
  try {
    const result = runGit('git rev-parse --is-inside-work-tree');
    return result === 'true';
  } catch {
    return false;
  }
}

function getCurrentBranch() {
  try {
    return runGit('git branch --show-current') || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

function loadStagedDiff() {
  const diff = runGit('git diff --cached --no-color');
  return diff.trim();
}

function filterLargeFiles(diff) {
  const ignorePatterns = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'dist/', 'build/', 'node_modules/', '.next/', 'coverage/', 'target/', 'vendor/'];
  const lines = diff.split('\n');
  const filtered = [];
  let skip = false;

  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      skip = ignorePatterns.some((pattern) => line.includes(pattern));
    }

    if (!skip) {
      filtered.push(line);
    }
  }

  return filtered.join('\n');
}

function stripModeOnlyChanges(diff) {
  const sections = diff.split(/^diff --git /m)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `diff --git ${part}`);

  const keepSections = sections.filter((section) => {
    const hasActualHunk = /^(@@ )/m.test(section);
    const hasContentChange = section.split('\n').some((line) => {
      return (line.startsWith('+') || line.startsWith('-')) && !line.startsWith('+++ ') && !line.startsWith('--- ');
    });

    const hasPermissionMetadata = /^(old mode |new mode |deleted file mode |new file mode )/m.test(section);

    if (!hasPermissionMetadata) {
      return true;
    }

    return hasActualHunk || hasContentChange;
  });

  return keepSections.join('\n');
}

function trimDiff(diff) {
  if (diff.length <= MAX_DIFF_CHARS) {
    return { diff, trimmed: false };
  }

  const parts = diff.split(/^diff --git /m).map((part) => (part.trim() ? `diff --git ${part}` : '')).filter(Boolean);
  let truncated = '';
  for (const part of parts) {
    if (truncated.length + part.length + 1 > MAX_DIFF_CHARS) {
      break;
    }
    truncated += (truncated ? '\n' : '') + part;
  }

  if (!truncated) {
    truncated = diff.slice(0, MAX_DIFF_CHARS);
  }

  return { diff: truncated, trimmed: true };
}

function makePrompt(branch, diff, type, scope) {
  const scopeHint = scope ? `${type}(${scope}): <subject>` : `${type}: <subject>`;
  const header = `You are an AI assistant that writes a single git commit message subject and up to three bullet points.`;
  const instructions = `
Write only the commit message in this format:
${scopeHint}

- bullet point 1
- bullet point 2
- bullet point 3

Rules:
- Use the provided type exactly: ${type}
- Do not change the commit type.
- Do not add explanation, reason, or metadata.
- If no scope is provided, omit the parentheses and use '${type}: <subject>'.
- Keep the subject imperative and concise.
- Provide at most 3 short bullet points.
- Return plain text only.
`;

  return `${header}\n${instructions}\nCurrent branch: ${branch}\nCommit type: ${type}\n${scope ? `Scope: ${scope}\n` : ''}Staged diff:\n${diff}`;
}

function parseModelMessage(message) {
  const trimmed = message.trim();
  const splitIndex = trimmed.indexOf('\n\n');
  if (splitIndex === -1) {
    return { title: trimmed.replace(/\r/g, ''), body: '' };
  }

  const title = trimmed.slice(0, splitIndex).replace(/\r/g, '');
  const body = trimmed.slice(splitIndex + 2).trim().replace(/\r/g, '');
  return { title, body };
}

async function getAICommitMessage(cerebras, branch, diff, type, scope) {
  const prompt = makePrompt(branch, diff, type, scope);
  const messages = [
    {
      role: 'system',
      content: `You are an AI assistant that writes a concise git commit subject and up to three bullet points. Output must begin with the given type and may include an optional scope.`,
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  let lastResponse = '';
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const completion = await cerebras.chat.completions.create({
        model: MODEL,
        messages,
        max_completion_tokens: 400,
        temperature: 0.2,
        top_p: 1,
        stream: false,
      });

      lastResponse = completion.choices?.[0]?.message?.content || '';
      if (!lastResponse) {
        if (attempt === 0) continue;
        break;
      }

      const parsed = parseModelMessage(lastResponse);
      if (verifyCommitMessageType(parsed.title, type)) {
        return { title: parsed.title, body: parsed.body, raw: lastResponse };
      }

      if (attempt === 0) {
        console.log(chalk.yellow('AI output did not preserve the commit type. Retrying once...'));
      }
    } catch (error) {
      throw error;
    }
  }

  return { title: `${type}: auto-generated commit`, body: '', raw: lastResponse };
}

function extractChangedFiles(diff) {
  const files = new Set();
  for (const line of diff.split('\n')) {
    if (line.startsWith('diff --git')) {
      const parts = line.split(' ');
      const aPath = parts[2]?.replace(/^a\//, '');
      const bPath = parts[3]?.replace(/^b\//, '');
      if (aPath) files.add(aPath);
      if (bPath) files.add(bPath);
    }
  }
  return [...files];
}

function detectScope(diff) {
  const files = extractChangedFiles(diff);
  if (files.length === 0) return '';

  const topDirs = files.map((file) => file.split('/')[0]).filter(Boolean);
  if (topDirs.length === 0) return '';

  const folderCounts = topDirs.reduce((acc, folder) => {
    acc[folder] = (acc[folder] || 0) + 1;
    return acc;
  }, {});

  const [topFolder, maxCount] = Object.entries(folderCounts).reduce(
    (best, entry) => (entry[1] > best[1] ? entry : best),
    ['', 0],
  );

  if (maxCount > 1 && topFolder && topFolder !== 'src') {
    return topFolder;
  }

  const firstFile = files[0];
  const fileName = firstFile.split('/').pop();
  if (fileName) {
    const baseName = fileName.replace(/\.[^.]+$/, '');
    return baseName;
  }

  return '';
}

function isOnlyDocs(diff) {
  const files = extractChangedFiles(diff);
  return files.length > 0 && files.every((file) => {
    return /\.(md|rst|txt|adoc|asciidoc)$/i.test(file) || /(^|\/)docs?(\/|$)/i.test(file);
  });
}

function isOnlyTests(diff) {
  const files = extractChangedFiles(diff);
  return files.length > 0 && files.every((file) => {
    return /(^|\/)(test|tests|__tests__|spec)(\/|$)/i.test(file) || /\.(test|spec)\.[jt]sx?$/i.test(file);
  });
}

function isOnlyConfigAndDeps(diff) {
  const files = extractChangedFiles(diff);
  return files.length > 0 && files.every((file) => {
    return /(^|\/)(package\.json|package-lock\.json|yarn\.lock|pnpm-lock\.ya?ml|\.npmrc|\.nvmrc|tsconfig(?:\..*)?\.json|\.eslintrc(?:\..*)?|\.prettierrc(?:\..*)?|\.babelrc(?:\..*)?|webpack\.config(?:\..*)?|rollup\.config(?:\..*)?|vite\.config(?:\..*)?|next\.config(?:\..*)?|jest\.config(?:\..*)?|babel\.config(?:\..*)?|dockerfile|docker-compose\.(?:yml|yaml)|\.github\/workflows\/.+|\.github\/.+\.yml|\.github\/.+\.yaml|\.gitignore|\.dockerignore|\.editorconfig|\.npmignore)$/i.test(file);
  });
}

function isFormattingOnly(diff) {
  return diff
    .split('\n')
    .every((line) => {
      if (!/^[+-]/.test(line)) return true;
      const content = line.slice(1).trim();
      return content === '' || /^\/\/|^\/\*|^\*|^\*/.test(content) || /^[{}()[\]<>;,:\.]+$/.test(content);
    });
}

function hasPerformanceKeyword(diff) {
  return /\b(perf|performance|optimi[sz]e|speed|latency|throughput|memory|cpu|benchmark|cache|memo(?:rize)?|fast(er)?|slow(er)?|reduce .*overhead|avoid .*allocation|vectorize|unroll)\b/i.test(diff);
}

function hasFixKeyword(diff) {
  return /\b(bug|fix(?:es|ed)?|error|exception|throw|catch|null|undefined|crash|fail(?:ure)?|incorrect|wrong|buggy|patch|handle error|error handling|validation)\b/i.test(diff);
}

function hasFeatureSignal(diff) {
  return /(^|\n)new file mode |\b(implements|exports\s+.*|export\s+(default|function|class|const|let|var)|public\s+function|private\s+function|func\s+\w+\(|class\s+\w+|interface\s+\w+|async\s+function|function\s+\w+|const\s+\w+\s*=\s*\(?[\w$]+\)?\s*=>)/i.test(diff);
}

function deterministicCommitType(diff) {
  if (isOnlyTests(diff)) return 'test';
  if (isOnlyDocs(diff)) return 'docs';
  if (isOnlyConfigAndDeps(diff)) return 'chore';
  if (isFormattingOnly(diff)) return 'style';
  if (hasPerformanceKeyword(diff) && !hasFixKeyword(diff)) return 'perf';
  if (hasFixKeyword(diff)) return 'fix';
  if (hasFeatureSignal(diff)) return 'feat';
  return 'refactor';
}

function verifyCommitMessageType(message, expectedType) {
  const firstLine = message.trim().split('\n')[0] || '';
  return firstLine.startsWith(`${expectedType}(`) || firstLine.startsWith(`${expectedType}:`);
}

async function askConfirmation(commitTitle, commitBody) {
  console.log(chalk.bold.green('\nProposed commit message:'));
  console.log(chalk.blue('Title:'), commitTitle);
  if (commitBody) {
    console.log(chalk.blue('Body:')); 
    console.log(commitBody);
  }

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: '¿Deseas ejecutar el commit? (Y = sí, N = cancelar, E = editar mensaje)',
      choices: [
        { name: 'Y - Commit', value: 'yes' },
        { name: 'N - Cancelar', value: 'no' },
        { name: 'E - Editar mensaje', value: 'edit' },
      ],
    },
  ]);

  return answer.choice;
}

async function editMessage(initialTitle, initialBody) {
  const fullText = `${initialTitle}\n\n${initialBody}`.trim();
  try {
    const answer = await inquirer.prompt([
      {
        type: 'editor',
        name: 'edited',
        message: 'Edita el mensaje de commit completo. Guarda y cierra el editor para continuar.',
        default: fullText,
      },
    ]);

    return answer.edited.trim();
  } catch {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Editar título:',
        default: initialTitle,
      },
      {
        type: 'editor',
        name: 'body',
        message: 'Editar cuerpo de commit (mantenlo en bullets si puedes):',
        default: initialBody || '- ',
      },
    ]);
    return `${answer.title.trim()}\n\n${answer.body.trim()}`.trim();
  }
}

function commitChanges(title, body) {
  const commitMessage = `${title}\n\n${body}`.trim();
  if (!title) {
    throw new Error('No se generó un título de commit válido.');
  }

  try {
    // Use --file - for safer multi-line body handling.
    execSync('git commit --file -', { input: commitMessage, encoding: 'utf8' });
  } catch (error) {
    throw new Error(error.stderr?.toString() || error.message || String(error));
  }
}

async function run() {
  console.log(chalk.bold.cyan('gcm — Git Commit Message AI'));

  if (!ensureGitRepo()) {
    exitWithError('No estás dentro de un repositorio git. Navega a un repo git y vuelve a intentar.');
  }

  const branch = getCurrentBranch();
  const rawDiff = loadStagedDiff();
  if (!rawDiff) {
    exitWithError('No hay cambios staged. Usa git add y vuelve a ejecutar gcm.');
  }

  const filteredDiff = stripModeOnlyChanges(filterLargeFiles(rawDiff));
  const commitType = deterministicCommitType(filteredDiff);
  const scope = detectScope(filteredDiff);
  const { diff, trimmed } = trimDiff(filteredDiff);

  console.log(chalk.magenta('Detected commit type:'), commitType);
  console.log(chalk.magenta('Detected scope:'), scope || 'none');
  console.log(chalk.magenta('Trimmed diff size:'), diff.length);

  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    exitWithError('Variable de entorno CEREBRAS_API_KEY no encontrada. Exporta la clave e intenta de nuevo.');
  }

  const cerebras = new Cerebras({ apiKey });

  console.log(chalk.gray('\nGenerando commit message con el modelo...'));
  let responseText;
  try {
    const result = await getAICommitMessage(cerebras, branch, diff, commitType, scope);
    responseText = result.raw;
    const { title, body } = result;
    responseText = responseText || '';

    if (!title) {
      exitWithError('La API devolvió un título de commit inválido. Intenta nuevamente.');
    }

    const { title: finalTitle, body: finalBody } = result;
    const commitTitle = finalTitle;
    const commitBody = finalBody;

    let chosen = await askConfirmation(commitTitle, commitBody);

    if (chosen === 'no') {
      console.log(chalk.yellow('Commit cancelado por el usuario.'));
      process.exit(0);
    }

    let finalMessageTitle = commitTitle;
    let finalMessageBody = commitBody;

    if (chosen === 'edit') {
      const edited = await editMessage(commitTitle, commitBody);
      const parsed = parseModelMessage(edited);
      finalMessageTitle = parsed.title;
      finalMessageBody = parsed.body;

      if (!finalMessageTitle) {
        exitWithError('El título editado quedó vacío. Abortando commit.');
      }
    }

    try {
      commitChanges(finalMessageTitle, finalMessageBody);
      console.log(chalk.green('\nCommit exitoso.'));
    } catch (error) {
      exitWithError(`Error al crear el commit: ${error.message}`);
    }

    return;
  } catch (error) {
    exitWithError(`Fallo al consultar la API de Cerebras: ${error.message || error}`);
  }

  if (chosen === 'no') {
    console.log(chalk.yellow('Commit cancelado por el usuario.')); 
    process.exit(0);
  }

  let finalTitle = title;
  let finalBody = body;

  if (chosen === 'edit') {
    const edited = await editMessage(title, body);
    const parsed = parseModelMessage(edited);
    finalTitle = parsed.title;
    finalBody = parsed.body;

    if (!finalTitle) {
      exitWithError('El título editado quedó vacío. Abortando commit.');
    }
  }

  try {
    commitChanges(finalTitle, finalBody);
    console.log(chalk.green('\nCommit exitoso.')); 
  } catch (error) {
    exitWithError(`Error al crear el commit: ${error.message}`);
  }
}

run().catch((error) => {
  exitWithError(error.message || String(error));
});
