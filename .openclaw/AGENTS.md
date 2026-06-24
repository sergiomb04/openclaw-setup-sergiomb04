# AGENTS.md - Workflow Automation Command Center

This workspace is a production automation environment. Treat it with professional rigor.

## 🚨 Security First Principles

**Data Protection Rules:**
- Never exfiltrate authentication tokens
- Store no credentials in memory files
- Assume all workspace files are sensitive until proven otherwise
- When in doubt, encrypt or omit

**Tool Permission Matrix:**
- Green zone (autonomous): Read operations, local file creation, Git commits
- Yellow zone (contextual): Google services, Telegram notifications, Composio tools
- Red zone (explicit approval): External APIs, new OAuth, destructive operations

**Privacy Boundaries:**
- User conversations stay in user channels
- Project details stay in project documentation
- System internals stay in system logs
- Never cross-pollinate without explicit purpose

## ⚡ Operational Limits

**Stop Immediately If:**
- Tool returns authentication error
- File operation would delete irreplaceable data
- Git operation would rewrite public history
- External service responds with rate limit
- User expresses uncertainty about proceeding

**Ask Before Proceeding If:**
- Action creates new external dependencies
- Tool usage exceeds historical patterns
- Outcome affects other people's work
- You're implementing a new automation pattern

**Proceed Confidently If:**
- Action aligns with explicit project requirements
- You've validated the tool is properly configured
- You have a rollback plan documented
- The risk/reward ratio favors automation

## 🛠️ Tool Governance

**Composio Integration Rules:**
1. Only use already-connected tools (no new OAuth)
2. Verify tool availability before designing workflows
3. Test tool responses before production use
4. Document tool limitations and edge cases

**OpenClaw Skill Architecture:**
1. Skills must be real OpenClaw skills, not prompts
2. Skills must integrate with existing tools
3. Skills must demonstrate architectural understanding
4. Skills must include proper error handling

**Git Workflow Standards:**
1. Commits must be logical and atomic
2. Messages must explain "why" not just "what"
3. History must be clean and reviewable
4. Branches must follow project conventions

## 📊 Quality Assurance

**Before Any External Action:**
- Verify tool connectivity
- Test with minimal data
- Confirm expected output format
- Document test results

**After Any External Action:**
- Verify action completed
- Capture evidence of success
- Note any anomalies
- Update documentation

**Continuous Validation:**
- Run `openclaw doctor` after configuration changes
- Test skill execution end-to-end
- Verify rubric criteria alignment
- Maintain audit trail

## 🚦 Escalation Framework

**Level 1: Autonomous Resolution**
.

- Tool errors with clear recovery paths
- Configuration issues with documented fixes
- Expected edge cases with handling procedures

**Levelとに: Contextual Decision**
-
-full workflow blocks needing user input
-tool availability changes
-rubric interpretation questions

**Level 3: Human Intervention Required**
-
-Security boundary crossings
-External dependency creation
-Project scope changes

## 📈 Performance Metrics

**Track For This Project:**
- Rubric criteria coverage percentage
- Skill implementation completeness
- Tool integration verification count
- Documentation thoroughness score

**Success Indicators:**
. 
- All checklist items completed
-Doctor runs clean
-Skills execute successfully
-EXPLANATION.md covers all decisions