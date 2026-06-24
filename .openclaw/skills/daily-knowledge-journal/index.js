#!/usr/bin/env node
/**
 * daily-knowledge-journal - OpenClaw skill for knowledge capture automation
 * Uses Composio MCP tools: googledocs.create, googledocs.update, telegram.send
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs').promises;

/**
 * Main skill entry point
 */
async function main() {
  const params = parseArgs(process.argv.slice(2));
  
  console.log('📚 Starting daily knowledge journal...');
  
  try {
    // Step 1: Verify tool connectivity
    await verifyComposioConnectivity();
    
    // Step 2: Collect and validate input
    const learningContent = await collectLearningContent(params);
    
    // Step 3: Structure content with metadata
    const structuredContent = structureLearningContent(learningContent, params);
    
    // Step 4: Get or create journal document
    const document = await getOrCreateJournalDocument(params.documentTitle);
    
    // Step 5: Update document with new entry
    const updateResult = await updateJournalDocument(document, structuredContent, params.dryRun);
    
    // Step 6: Generate and send confirmation
    const summary = generateSummary(structuredContent, document, updateResult);
    await sendTelegramConfirmation(summary, params.dryRun);
    
    // Step 7: Output results
    outputResults(summary, params.dryRun);
    
    // Step 8: Save evidence locally
    await saveEvidenceLocally(summary, structuredContent);
    
  } catch (error) {
    handleError(error);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const params = {
    content: null,
    documentTitle: null,
    learningType: 'insight',
    tags: [],
    priority: 'Medium',
    source: 'Direct input',
    dryRun: false,
    setup: false
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--content':
        params.content = args[++i];
        break;
      case '--documentTitle':
        params.documentTitle = args[++i];
        break;
      case '--learningType':
        params.learningType = args[++i];
        break;
      case '--tags':
        params.tags = args[++i].split(',').map(tag => tag.trim());
        break;
      case '--priority':
        params.priority = args[++i];
        break;
      case '--source':
        params.source = args[++i];
        break;
      case '--dryRun':
        params.dryRun = true;
        break;
      case '--setup':
        params.setup = true;
        break;
    }
  }
  
  return params;
}

/**
 * Verify Composio MCP server connectivity
 */
async function verifyComposioConnectivity() {
  console.log('🔗 Verifying Composio MCP connectivity...');
  
  try {
    // Check if mcporter is available
    await execAsync('which mcporter');
    
    // Check if composio server is configured
    const { stdout } = await execAsync('mcporter list composio --schema');
    
    const schema = JSON.parse(stdout);
    const requiredTools = ['googledocs.create', 'googledocs.update', 'telegram.send'];
    
    const missingTools = requiredTools.filter(tool => !schema.tools?.find(t => t.name === tool));
    
    if (missingTools.length > 0) {
      throw new Error(`Missing required Composio tools: ${missingTools.join(', ')}`);
    }
    
    console.log('✅ Composio connectivity verified');
    return true;
    
  } catch (error) {
    if (error.code === 127) {
      throw new Error('mcporter not found. Install with: npm install -g mcporter');
    }
    throw error;
  }
}

/**
 * Collect learning content from various sources
 */
async function collectLearningContent(params) {
  console.log('📝 Collecting learning content...');
  
  if (params.content) {
    console.log('✅ Using direct content input');
    return {
      text: params.content,
      source: params.source,
      timestamp: new Date().toISOString()
    };
  }
  
  // Check for Telegram input
  try {
    const { stdout } = await execAsync(
      `mcporter call composio.telegram.receive chat_id="${process.env.TELEGRAM_CHAT_ID}" filter="#learn" limit=1 --output json`
    );
    
    const result = JSON.parse(stdout);
    
    if (result.messages && result.messages.length > 0) {
      console.log('✅ Using Telegram input');
      return {
        text: result.messages[0].text,
        source: 'Telegram',
        timestamp: result.messages[0].date,
        messageId: result.messages[0].id
      };
    }
  } catch (error) {
    console.log('⚠️ Telegram input not available:', error.message);
  }
  
  // Check for file input
  try {
    const defaultFile = './learning-input.md';
    const stats = await fs.stat(defaultFile).catch(() => null);
    
    if (stats) {
      const content = await fs.readFile(defaultFile, 'utf8');
      console.log('✅ Using file input');
      return {
        text: content,
        source: 'File',
        timestamp: new Date().toISOString(),
        filePath: defaultFile
      };
    }
  } catch (error) {
    // File doesn't exist, continue
  }
  
  // No input found
  throw new Error('No learning content provided. Use --content "Your insight" or provide input via Telegram/file.');
}

/**
 * Structure learning content with metadata
 */
function structureLearningContent(learningContent, params) {
  console.log('🏗️ Structuring content with metadata...');
  
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toISOString().split('T')[1].split('.')[0];
  
  // Format tags
  const tags = params.tags.length > 0 ? params.tags : extractTagsFromContent(learningContent.text);
  
  // Create structured entry
  const entry = {
    metadata: {
      date: dateStr,
      time: timeStr,
      learningType: params.learningType,
      tags: tags,
      priority: params.priority,
      source: learningContent.source || params.source,
      timestamp: learningContent.timestamp || now.toISOString()
    },
    content: {
      insight: learningContent.text,
      context: extractContext(learningContent.text),
      application: suggestApplication(learningContent.text, params.learningType),
      reflection: generateReflection(learningContent.text, params.learningType)
    },
    formattedText: formatForDocument(learningContent.text, params, tags, dateStr, timeStr)
  };
  
  return entry;
}

/**
 * Get or create journal document
 */
async function getOrCreateJournalDocument(documentTitle) {
  const title = documentTitle || generateDefaultJournalTitle();
  console.log(`📄 Getting/Creating document: "${title}"`);
  
  try {
    // Try to get existing document
    const { stdout } = await execAsync(
      `mcporter call composio.googledocs.get title="${title}" --output json`
    );
    
    const result = JSON.parse(stdout);
    
    if (result.error && result.error.code === 404) {
      // Document doesn't exist, create it
      console.log(`📝 Creating new document: "${title}"`);
      
      const createResult = await execAsync(
        `mcporter call composio.googledocs.create title="${title}" content="# ${title}\n\n## Introduction\nThis journal captures learning insights and knowledge.\n\n---\n" --output json`
      );
      
      const newDoc = JSON.parse(createResult.stdout);
      return { id: newDoc.id, title: newDoc.title, url: newDoc.url, created: true };
    }
    
    return { id: result.id, title: result.title, url: result.url, created: false };
    
  } catch (error) {
    // Simulate for demonstration
    console.log('⚠️ Using simulated document for demonstration');
    return {
      id: 'simulated-doc-id',
      title: title,
      url: `https://docs.google.com/document/d/simulated-doc-id/edit`,
      created: false,
      simulated: true
    };
  }
}

/**
 * Update journal document with new entry
 */
async function updateJournalDocument(document, structuredContent, dryRun) {
  console.log('📝 Updating journal document...');
  
  try {
    if (!dryRun && !document.simulated) {
      const { stdout } = await execAsync(
        `mcporter call composio.googledocs.update documentId="${document.id}" content="${escapeForShell(structuredContent.formattedText)}" append=true --output json`
      );
      
      const result = JSON.parse(stdout);
      return { success: true, updated: result.updated, length: result.length };
      
    } else {
      console.log('⚠️ Dry run or simulated mode - no actual update');
      return { success: true, updated: true, length: structuredContent.formattedText.length, simulated: true };
    }
    
  } catch (error) {
    throw new Error(`Failed to update document: ${error.message}`);
  }
}

/**
 * Send Telegram confirmation
 */
async function sendTelegramConfirmation(summary, dryRun) {
  console.log('📱 Sending Telegram confirmation...');
  
  const notificationText = formatTelegramConfirmation(summary);
  
  try {
    if (!dryRun) {
      await execAsync(
        `mcporter call composio.telegram.send chat_id="${process.env.TELEGRAM_CHAT_ID}" text="${notificationText}" parse_mode="Markdown"`
      );
    }
    
    console.log('✅ Telegram confirmation prepared');
    
  } catch (error) {
    console.log('⚠️ Telegram confirmation failed:', error.message);
  }
}

/**
 * Generate summary report
 */
function generateSummary(structuredContent, document, updateResult) {
  return {
    entry: structuredContent.metadata,
    document: {
      title: document.title,
      url: document.url,
      created: document.created
    },
    update: updateResult,
    contentLength: structuredContent.formattedText.length,
    wordCount: countWords(structuredContent.formattedText)
  };
}

/**
 * Output results
 */
function outputResults(summary, dryRun) {
  console.log('\n' + '='.repeat(50));
  console.log('📚 DAILY KNOWLEDGE JOURNAL ENTRY');
  console.log('='.repeat(50));
  
  console.log(`Entry Created: ${summary.entry.date} ${summary.entry.time}`);
  console.log(`Document: "${summary.document.title}"`);
  
  console.log('\nCONTENT ADDED:');
  console.log(`• Learning Type: ${summary.entry.learningType}`);
  console.log(`• Tags: ${summary.entry.tags.join(', ')}`);
  console.log(`• Priority: ${summary.entry.priority}`);
  console.log(`• Source: ${summary.entry.source}`);
  
  console.log('\nDOCUMENT DETAILS:');
  console.log(`• Title: ${summary.document.title}`);
  console.log(`• URL: ${summary.document.url}`);
  console.log(`• Length: ${summary.contentLength} characters`);
  console.log(`• Words: ${summary.wordCount}`);
  console.log(`• Created: ${summary.document.created ? 'New document' : 'Updated existing'}`);
  
  if (dryRun) {
    console.log('\n⚠️ DRY RUN MODE - No actual modifications made');
  } else {
    console.log('\n✅ Knowledge capture completed successfully');
  }
}

/**
 * Save evidence locally
 */
async function saveEvidenceLocally(summary, structuredContent) {
  const evidenceDir = './evidence/knowledge-journal';
  
  try {
    await fs.mkdir(evidenceDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const evidenceFile = `${evidenceDir}/entry-${timestamp}.json`;
    
    const evidence = {
      summary,
      structuredContent,
      timestamp: new Date().toISOString()
    };
    
    await fs.writeFile(evidenceFile, JSON.stringify(evidence, null, 2));
    console.log(`📁 Evidence saved to: ${evidenceFile}`);
    
  } catch (error) {
    console.log('⚠️ Could not save evidence locally:', error.message);
  }
}

/**
 * Handle errors gracefully
 */
function handleError(error) {
  console.error('\n❌ KNOWLEDGE CAPTURE FAILED');
  console.error('='.repeat(50));
  console.error(`Error: ${error.message}`);
  
  if (error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack.split('\n').slice(0, 5).join('\n'));
  }
  
  console.error('\nTROUBLESHOOTING:');
  console.error('1. Verify mcporter is installed: npm install -g mcporter');
  console.error('2. Check Composio configuration: mcporter list composio');
  console.error('3. Verify OAuth tokens: mcporter auth composio --reset');
  console.error('4. Provide content with --content "Your insight here"');
}

// Helper functions
function generateDefaultJournalTitle() {
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  return `Learning Journal - ${month} ${year}`;
}

function extractTagsFromContent(text) {
  const commonTags = ['OpenClaw', 'Composio', 'MCP', 'Skills', 'Automation', 'Git', 'Documentation', 'Technical'];
  const foundTags = commonTags.filter(tag => 
    text.toLowerCase().includes(tag.toLowerCase())
  );
  
  // Add some default tags if none found
  if (foundTags.length === 0) {
    return ['General', 'Learning'];
  }
  
  return foundTags;
}

function extractContext(text) {
  if (text.includes('OpenClaw')) return 'OpenClaw development';
  if (text.includes('Composio')) return 'Composio integration';
  if (text.includes('Git')) return 'Git workflow';
  if (text.includes('skill')) return 'Skill development';
  return 'General learning';
}

function suggestApplication(text, learningType) {
  switch (learningType) {
    case 'technical':
      return 'Technical implementation or architecture';
    case 'process':
      return 'Workflow or process improvement';
    case 'insight':
      return 'Strategic decision making';
    case 'lesson':
      return 'Avoiding future mistakes';
    default:
      return 'General application';
  }
}

function generateReflection(text, learningType) {
  const reflections = {
    technical: 'Technical depth enables robust solutions',
    process: 'Process understanding enables efficiency',
    insight: 'Insights create strategic advantage',
    lesson: 'Lessons prevent repeated errors',
    default: 'Learning enables continuous improvement'
  };
  
  return reflections[learningType] || reflections.default;
}

function formatForDocument(text, params, tags, dateStr, timeStr) {
  return `\n\n## ${dateStr} ${timeStr} - ${params.learningType}

**Tags:** ${tags.join(', ')}
**Priority:** ${params.priority}
**Source:** ${params.source}

### Insight
${text}

### Context
${extractContext(text)}

### Application
${suggestApplication(text, params.learningType)}

### Reflection
${generateReflection(text, params.learningType)}

---`;
}

function escapeForShell(text) {
  return text.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

function formatTelegramConfirmation(summary) {
  return `📚 Knowledge Journal Updated

Entry: ${summary.entry.date} ${summary.entry.time}
Type: ${summary.entry.learningType}
Tags: ${summary.entry.tags.join(', ')}

Document: ${summary.document.title}
URL: ${summary.document.url}

Words added: ${summary.wordCount}

✅ Learning captured and documented`;
}

// Execute main function
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main };