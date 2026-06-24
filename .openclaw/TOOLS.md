# TOOLS.md - Workflow Integration Specifications

This document defines the precise usage patterns, priorities, conventions, and expected behaviors for each integrated tool in this automation environment.

## 📧 Gmail Integration

**When to Use:**
-a- Email triage workflows (Inbox → Task conversion)
-b- Urgent communication detection
-c- Notification aggregation
-d- Correspondence tracking

**Priority Levels:**
1. **Critical:** Unread emails marked as important by sender
2. **High:** Unread emails from known contacts with actionable content
3. **Medium:** Newsletter subscriptions with deadline information
4. **Low:** Automated system notifications

**Conventions:**
- Always preserve email thread context when creating tasks
- Include sender, subject, and date in task descriptions
- Never delete emails autonomously
- Archive processed emails after task creation

**Expected Behavior:**
- Read-only access for triage operations
- Structured extraction of actionable content
- Respect for email privacy boundaries
- Clear mapping from email metadata to task attributes

**Output Format:**
```
📧 Email Triage Result:
- From: [sender]
- Subject: [subject]
- Date: [date]
- Actionability: [High/Medium/Low]
- Task Created: [Yes/No]
- Task Title: [if created]
- Summary: [brief extraction]
```

## 📄 Google Docs Integration

**When to Use:**
- Knowledge documentation workflows
- Meeting note persistence
- Project plan maintenance
- Learning journal compilation

**Priority Levels:**
1. **Critical:** User-requested document creation
2. **High:** Automated knowledge capture from conversations
3. **Medium:** Template-based document generation
4. **Low:** Document organization and cleanup

**Conventions:**
- Use consistent document naming: "YYYY-MM-DD [Topic] - [Source]"
- Maintain hierarchical structure: H1 → H2 → H3
- Include metadata headers: Author, Date, Context
- Preserve source attribution when appropriate

**Expected Behavior:**
- Create documents with proper formatting
- Update existing documents when referenced
- Never overwrite user content without verification
- Maintain document organization standards

**Output Format:**
```
📄 Document Creation Result:
- Title: [document title]
- ID: [Google Docs document ID]
- URL: [direct access link]
- Length: [word count]
- Structure: [heading hierarchy]
- Telegram Notification: [sent/not sent]
```

## 📅 Google Calendar Integration

**When to Use:**
- Event creation from time-sensitive emails
- Meeting scheduling automation
- Deadline tracking
- Availability coordination

**Priority Levels:**
1. **Critical:** Calendar events with <24h notice
2. **High:** Recurring meetings and deadlines
3. **Medium:** Event discovery and summarization
4. **Low:** Calendar cleanup and organization

**Conventions:**
- Always include timezone in event descriptions
- Set appropriate reminders based on event type
- Preserve attendee information when available
- Use consistent event naming conventions

**Expected Behavior:**
- Read calendar for upcoming events
.

-Create events with proper metadata
- Update events when information changes
- Never delete calendar entries autonomously

**Output Format:**
```
📅 Calendar Operation Result:
- Operation: [read/create/update]
- Event Count: [number processed]
- Next Event: [title + time]
- Changes Made: [list of modifications]
```

## 📁 Google Drive Integration

**When to Use:**
- Document organization workflows
- File sharing automation
- Folder structure maintenance
- Cross-document reference management

**Priority Levels:**
1. **Critical:** User-requested file operations
2. **High:** Automated document filing
3. **Medium:** Drive organization and cleanup
4. **Low:** Metadata extraction and reporting

**Conventions:**
- Maintain logical folder hierarchy
- Use descriptive file naming
- Preserve file permissions when moving
- Document file locations for future reference

**Expected Behavior:**
- Organize files into appropriate folders
- Create folder structures when needed
- Never delete files without explicit instruction
- Maintain file metadata consistency

**Output Format:**
```
📁 Drive Operation Result:
- Operation: [organize/move/create]
- Files Processed: [count]
- Structure Created: [folder hierarchy]
- Changes: [summary of modifications]
```

## ✅ Google Tasks Integration

**When to Use:**
- Email-to-task conversion workflows
- Meeting action item capture
- Project task decomposition
- Deadline tracking automation

**Priority Levels:**
1. **Critical:** Time-sensitive tasks (<24h deadline)
2. **High:** Action items from important communications
3. **Medium:** Routine task creation from patterns
4. **Low:** Task organization and prioritization

**Conventions:**
- Use consistent task naming: "Action: [verb] [object]"


- Include source context in notes
. 
- Set appropriate due dates based on urgency
- Use task lists for categorization

**Expected Behavior:**
-T- Create tasks from actionable inputs
- Update task status when completed
-n Never delete tasks autonomously
 -Maintain task list organization

**Output Format:**
```
✅ Task Creation Result:
-
- Task Created: [Yes/No]
- Task Title: [if created]
- Task List: [destination list]
- Due Date: [if set]
  Notes: [context included]
  Source: [original input source]
```

## 🐙 GitHub Integration

**When to Use:**
- Repository management workflows
- Commit automation and message generation
- Issue tracking integration
-, Project documentation synchronization

**Priority Levels:**
1. **Critical:** Rubric-required Git operations
2. **High:** Project commit history maintenance
3. **Medium:** Repository organization
4. **Low:** GitHub metadata extraction

**Conventions:**
- Use Conventional Commits format
- Maintain clean, logical commit history
- Include issue references when applicable
-
- Preserve repository integrity

**Expected Behavior:**
- Execute Git operations with precision
- Generate meaningful commit messages
- Never force-push or rewrite public history
- Maintain branch discipline

**Output Format:**
```
🐙 Git Operation Result:
- Operation: [commit/push/branch/etc.]
- Files Changed: [count]
- Commit Message: [message used]
 — Branch: [current branch]
 — Status: [success/failure details]
```

## 💬 Telegram Integration

**When to Use:**
- Notification delivery workflows
- Status update communications
- Quick confirmation requests
- Progress milestone reporting

**Priority Levels:**
1. **Critical:** Time-sensitive notifications
2. **High:** Skill execution confirmations
3. **Medium:** Daily summary reports
4. **Low:** Routine status updates

**Conventions:**
- Use clear, concise message formatting
- Include relevant emoji for visual scanning
·Provide actionable links when available
·Respect conversation flow and timing

**Expected Behavior:**
- Deliver notifications promptly
- Format messages for readability
- Never spam or over-notify
- Maintain professional tone

**Output Format:**
```
💬 Telegram Notification:
- Recipient: [user/channel]
- Message Type: [confirmation/alert/summary]
- Content: [message summary]
- Links Included: [Yes/No]
Here is a way to do this that has been done]
- Delivery Status: [sent/failed]
```

## 🔧 Tool Orchestration Patterns

**Workflow Templates:**

1. **Inbox Triage:**
   Gmail → Google Tasks → Telegram

2. **Knowledge Capture:**
   Telegram → Google Docs → Telegram

3. **Meeting Management:**
   Google Calendar → Google Tasks → Telegram

4. **Project Update:**
   Git → Telegram → Google Docs

**Integration Rules:**
- Always verify tool connectivity before orchestration
- Test each component independently before chaining
• Document integration points and data flows
- Handle errors gracefully with rollback plans

**Success Verification:**
- Each tool operation must produce verifiable output
- Cross-tool workflows must show data continuity
- All integrations must align with rubric criteria
-Documentation must explain tool interaction mechanics