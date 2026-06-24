# SKILLS_DESIGN.md - OpenClaw Skill Architecture Design

This document defines the architecture, input requirements, output specifications, and implementation details for the OpenClaw skills implemented in this project.

## 🎯 Design Philosophy

**Core Principles:**
1. **Real OpenClaw Skills:** Not prompts, but proper skill implementations following OpenClaw architecture
2. **Composio Integration:** Demonstrate tool connectivity through actual API usage
3. **Production Readiness:** Include error handling, validation, and verification
4. **Rubric Alignment:** Each skill directly addresses specific evaluation criteria
5. **Documentation Depth:** Provide sufficient detail for manual review and understanding

**Architecture Compliance:**
- Skills must reside in proper skill directories
- Each skill must have SKILL.md documentation
- Implementation must use OpenClaw skill patterns
- Tools must be called through proper OpenClaw interfaces

## 🧠 SKILL 1: Inbox Triage

### ¿Qué hace esta skill?

**Primary Function:** Automatically triage unread emails, detect actionable items, create Google Tasks, and generate summary reports.

**Workflow Steps:**
1. **Email Retrieval:** Fetch unread emails from Gmail via Composio
2. **Actionability Analysis:** Classify emails based on content, sender, and context
3. **Task Creation:** Convert actionable emails into Google Tasks with proper metadata
4. **Email Processing:** Archive processed emails after task creation
5. **Summary Generation:** Create a structured summary of triage operations
6. **Notification Delivery:** Send Telegram confirmation with results

**Integration Points:**
- Gmail → Google Tasks → Telegram

**Business Value:**
-
 -Reduces email overload by converting messages to actionable tasks
- Ensures no actionable communication is missed
- Creates audit trail from email → task conversion
- Provides visibility into email processing patterns

### ¿Qué input necesita?

**Required Input:**
1. **User Context:** Must have Gmail, Google Tasks, and Telegram configured via Composio
2. **Trigger:** Can be manual invocation or scheduled via cron/heartbeat
3. **Parameters:**
   - `maxEmails`: Maximum number of emails to process (default: us1-0)
   - `urgencyFilter`: Process only emails above certain urgency (optional)
   - `taskList`: Specific Google Tasks list for created tasks (optional)

**Implicit Dependencies:**
- Valid OAuth tokens for Google services
.
- Telegram bot permissions
- Network connectivity to Composio services
- Sufficient API rate limits

**Validation Requirements:**
- Verify Gmail access before email retrieval
The verification of Google Tasks connectivity before task creation
- Confirm Telegram channel access before notification
- Test with small batch before full processing

### ¿Cómo es un buen output?

**Success Criteria:**
1. **Functional:** Emails processed, tasks created, notifications sent
2. **Accurate:** Tasks correctly reflect email content and urgency
3. **Complete:** All unread emails evaluated, no silent failures
4. **Verifiable:** Evidence of each operation preserved

**Output Format:**
```
📧 INBOX TRIAGE REPORT
──────────────────────
Processed: 8/15 unread emails
Actionable: 3 emails converted to tasks
Non-Actionable: 5 emails archived

CREATED TASKS:
1. "Review Q2 Project Plan - due 2026-06-26"
   • From: project.manager@company.com
   • Source: "Q2 Planning Document Attached"
   • List: Work
   
2. "Approve Team Budget Request - due 2026-06-25"
   • From: finance@company.com  
   • Source: "Budget Approval Required"
   • List: Work
   
3. "Schedule Meeting with Client X - due 2026-06-24"
   • From: client.x@external.com
   • Source: "Meeting Availability Request"
   • List: Meetings

SUMMARY:
• High Urgency: 1 task created
• Medium Urgency: 2 tasks created
• Archived: 5 emails
• Failed: 0 emails

📱 Telegram notification sent to user
✅ Google Tasks updated in "Work" and "Meetings" lists
📧 Gmail inbox reduced from 15 to 7 unread emails
```

**Evidence Requirements:**
---

1. **Gmail Evidence:** Screenshot showing reduced unread count
2. **Google Tasks Evidence:** Screenshot showing created tasks with proper metadata
3. **Telegram Evidence:** Message showing notification delivery
4. **Log Evidence:** OpenClaw session logs showing tool execution
5. **Error Handling Evidence:** Demonstration of graceful failure recovery

## 📚 SKILL 2: Daily Knowledge Journal

### ¿Qué hace esta skill?

**Primary Function:** Capture learning insights, create structured journal entries in Google Docs, and confirm completion via Telegram.

**Workflow Steps:**
1. **Input Collection:** Receive learning insights via Telegram message or direct invocation
2. **Content Structuring:** Organize insights into standardized journal format
3. **Document Creation/Update:** Create new Google Doc or append to existing journal
4. **Metadata Inclusion:** Add date, context, tags, and learning type
5. **Formatting Application:** Apply consistent document formatting and structure
6. **Confirmation Delivery:** Send Telegram message with document link and summary

**Integration Points:**
- Telegram → Google Docs → Telegram

**Business Value:**
-Captures and preserves valuable learning moments
- Creates searchable knowledge repository
- Enables knowledge sharing and reflection
- Provides continuity in learning journey

### ¿Qué input necesita?

**Required Input:**
1. **Learning Content:** Text containing insight, lesson, or knowledge to capture
2. **Context Information:** Source, relevance, and application context
3. **Trigger:** Telegram message with specific format or direct skill invocation
4. **Parameters:**
   - `documentTitle`: Specific document to update (optional, defaults to date-based)
   - `learningType`: Classification (technical, process, insight, lesson)
   - `tags`: Categorization keywords for searchability
   - `priority`: Importance level for organization

**Implicit Dependencies:**
-

- Valid Google Docs API access
- Telegram message parsing capability
- Document template or structure definition
. 
- Network connectivity to Composio services

**Validation Requirements:**
- Verify Google Docs access before document operations
- Validate input format and completeness
- Test document creation with small content first
- Confirm Telegram notification capability

### ¿Cómo es un buen output?

**Success Criteria:**
1. **Functional:** Document created/updated with proper content
2. **Structured:** Content organized with consistent formatting
3. **Accessible:** Document link provided and working
4. **Complete:** All metadata included for future reference
5. **Confirmed:** Telegram notification delivered with verification

**Output Format:**
```
📚 DAILY KNOWLEDGE JOURNAL ENTRY
─────────────────────────────────
Entry Created: 2026-06-24 19:15 UTC
Document: "IA Engineering Learning Journal - 2026-06"

CONTENT ADDED:
• Learning Type: Technical
• Tags: OpenClaw, Skills, Composio, Integration
• Priority: High

INSIGHT:
"OpenClaw skills must demonstrate actual tool integration through Composio, not just prompt-based responses. The skill architecture requires proper error handling and verification evidence for production readiness."

STRUCTURE:
- Date: 2026-06-24
. 
- Source: 4Geeks Academy IA Engineer Bootcamp
- Context: Skill implementation phase
- Application: Project rubric criteria fulfillment
- Reflection: Importance of architectural correctness over quick solutions

DOCUMENT DETAILS:
• Title: IA Engineering Learning Journal - 2026-(6)
• URL: https://docs.google.com/document/d/ABC123...
• Length: 1,245 words (added 187 words)
• Sections: 12 total learning entries

📱 Telegram confirmation sent with document link
✅ Google Docs updated with structured entry
🔍 Entry tagged for future searchability
```

**Evidence Requirements:**
1. **Google Docs Evidence:** Screenshot showing created/updated document with proper formatting
2. **Document URL Evidence:** Working link to the created document
3. **Telegram Evidence:** Message showing notification with document link
4. **Content Evidence:** Demonstration of structured formatting (headings, metadata, organization)
5. **Log Evidence:** OpenClaw session logs showing skill execution flow

## 🔧 Implementation Architecture

### Skill Directory Structure
```
.openclaw/skills/
├── inbox-triage/
│   ├── SKILL.md
│   ├── index.js
│   └── package.json
└── daily-knowledge-journal/
    ├── SKILL.md
    ├── index.js
    └── package.json
```

### Composio Tool Usage Mapping

**Inbox Triage Tool Dependencies:**
1. `gmail.read` - Email retrieval
2. `gmail.modify` - Email archiving  
3. `googletasks.create` - Task creation
4. `googletasks.list` - Task list management
5. `telegram.send` - Notification delivery

**Daily Knowledge Journal Tool Dependencies:**
1. `googledocs.create` - Document creation
2. `googledocs.update` - Document appending
3. `googledocs.get` - Document retrieval
4. `telegram.send` - Notification delivery
5. `telegram.receive` - Input collection (optional)

### Error Handling Strategy

**Tiered Error Response:**
1. **Tool Connectivity Errors:** Attempt reconnection, then fail gracefully with diagnostic information
2. **API Rate Limit Errors:** Implement exponential backoff, resume when possible
3. **Data Validation Errors:** Provide clear error messages with correction guidance
4. **Network Errors:** Cache operations locally, retry with persistence
5. **Permission Errors:** Stop immediately, report exact permission deficiency

### Testing Methodology

**Pre-Production Validation:**
1. **Unit Tests:** Each tool call tested independently
2. **Integration Tests:** Full workflow tested with mock data
3. **Production Tests:** Small-scale execution with verification
4. **Regression Tests:** Previous successful executions revalidated

**Evidence Collection:**
1. **Screenshots:** Before/after states of connected services
2. **Logs:** Complete OpenClaw execution logs
3. **API Responses:** Key API responses preserved
4. **User Confirmations:** Telegram message delivery confirmations

## 📊 Rubric Alignment Matrix

**Inbox Triage Addresses:**
- ✓ Real OpenClaw skill (not prompt)
- ✓ Composio integration (Gmail + Google Tasks + Telegram)
- ✓ Output verified in connected services
--✓ No new APIs/OAuth (uses already-connected tools)
- ✓ Behavior reflects personalized configuration
- ✓ Sufficient documentation depth

**Daily Knowledge Journal Addresses:**
- ✓ Real OpenClaw skill (not prompt)
- ✓ Composio integration (Google Docs + Telegram)
- ✓ Output verified in connected services
- ✓ No new APIs/OAuth (uses already-connected tools)
- ✓ Behavior reflects personalized configuration
- ✓ Sufficient documentation depth

**Both Skills Together Address:**
- ✓ Minimum two skills requirement
- ✓ Architectural correctness
- ✓ Production readiness
- ✓ Error handling completeness
- ✓ Verification evidence availability
- ✓ Design decision documentation

## 🚀 Implementation Roadmap

**Phase 1: Skill Skeleton Creation**
- Create skill directory structure
)

- Write SKILL.md documentation
- Set up basic Node.js skill framework

**Phase 2: Tool Integration Implementation**
- Implement Composio tool calls
- Add data transformation logic
-P- Create workflow orchestration

**Phase 3: Error Handling & Validation**
- Add comprehensive error handling
- Implement input validation
- Create recovery procedures

**Phase 4: Testing & Verification**
-

Execute skill with test data
- Collect verification evidence
- Validate rubric alignment

**Phase 5: Documentation & Commit**
- Update design documentation
- Commit with proper messages
 -Prepare final evidence package