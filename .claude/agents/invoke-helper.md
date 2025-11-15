# Agent Invocation Helper

This document guides Claude Code on how to invoke agents based on user input.

## Recognition Table

| User Input Pattern | Agent to Invoke | Agent File |
|-------------------|-----------------|------------|
| `deploy`, `run deploy-manager`, `run deploy` | deploy-manager | `.claude/agents/deploy-manager.md` |
| `backend dev`, `run backend-developer`, `backend` | backend-developer | `.claude/agents/backend-developer.md` |
| `frontend dev`, `run frontend-developer`, `frontend` | frontend-developer | `.claude/agents/frontend-developer.md` |
| `production bug hunter`, `run production-bug-hunter`, `bug hunter` | production-bug-hunter | `.claude/agents/production-bug-hunter.md` |
| `plan`, `run planning-collaborator`, `planning` | planning-collaborator | `.claude/agents/planning-collaborator.md` |
| `gantt`, `run gantt-bug-hunter`, `gantt bug hunter` | gantt-bug-hunter | `.claude/agents/gantt-bug-hunter.md` |
| `run all agents` | ALL | Run all 6 agents in parallel |

## How to Invoke an Agent

When a user request matches one of the patterns above:

1. **Read the agent's markdown file** from `.claude/agents/[agent-name].md`
2. **Parse the agent's instructions** including:
   - Purpose and capabilities
   - When to use
   - Tools available
   - Success criteria
3. **Launch the agent** using the Task tool with `subagent_type: "general-purpose"`
4. **Pass clear instructions** including:
   - What the user wants
   - The agent's specialized role
   - Expected deliverables
5. **Update run history** in `.claude/agents/run-history.json`:
   - Increment `total_runs`
   - Set `last_run` to current timestamp
   - Set `last_status` to "success" or "failed"
   - Add run entry to `runs` array

## Example Invocation

```javascript
// User says: "deploy"
// 1. Read .claude/agents/deploy-manager.md
// 2. Extract instructions and capabilities
// 3. Launch Task with:
{
  subagent_type: "general-purpose",
  description: "Deploy to staging",
  prompt: `You are the Deploy Manager agent. Your role is to handle git operations and staging deployments.

CAPABILITIES:
- Git add, commit, push operations
- Deploy backend to Heroku staging (rob branch)
- Verify deployment success
- Check for migration errors

AUTHORITY:
✅ STAGING: HAS authority to deploy from rob branch to Heroku staging
❌ PRODUCTION: Does NOT have authority to deploy to production from main branch

USER REQUEST: ${user_request}

TASKS:
1. Commit and push changes to rob branch
2. Deploy backend using git subtree to Heroku staging
3. Verify deployment and check for errors
4. Report status to user

Follow the deployment protocol in your agent definition exactly.`
}
// 4. After agent completes, update run-history.json
```

## Run History Update

After each agent run, update `.claude/agents/run-history.json`:

```json
{
  "agents": {
    "deploy-manager": {
      "total_runs": 1,
      "successful_runs": 1,
      "failed_runs": 0,
      "last_run": "2025-11-16T10:30:00Z",
      "last_status": "success",
      "last_message": "Successfully deployed to staging",
      "runs": [
        {
          "timestamp": "2025-11-16T10:30:00Z",
          "status": "success",
          "message": "Successfully deployed to staging",
          "duration_seconds": 45
        }
      ]
    }
  }
}
```

## Run All Agents

When user requests "run all agents":

1. Launch all 6 agents **in parallel** using a single message with 6 Task tool calls
2. Give each agent a health check task appropriate to their specialty
3. Wait for all agents to complete
4. Update run history for all agents
5. Report aggregated results
