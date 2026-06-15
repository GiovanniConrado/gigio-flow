#!/usr/bin/env node

/**
 * mcp-linear.js — MCP Server for Linear
 *
 * Standalone MCP (Model Context Protocol) server that exposes Linear
 * operations as tools. Any MCP-compatible client (Opencode, Cursor,
 * Cline, Claude Desktop) can connect to it.
 *
 * Usage:
 *   node dashboard/mcp-linear.js
 *
 * Environment:
 *   LINEAR_API_KEY   — required. Linear API key (starts with "lin-api-")
 *   LINEAR_TEAM_ID   — optional. Default team ID
 */

import https from 'https';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Config ──────────────────────────────────────────────────────────────────

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || '';
const DEFAULT_TEAM_ID = process.env.LINEAR_TEAM_ID || '';

// Try loading from linear-config.json as fallback
function loadConfigFallback() {
  if (LINEAR_API_KEY) return;
  const configPath = join(__dirname, 'linear-config.json');
  if (existsSync(configPath)) {
    try {
      const cfg = JSON.parse(readFileSync(configPath, 'utf8'));
      if (cfg.apiKey && cfg.apiKey !== '***CONFIGURADA***') {
        process.env.LINEAR_API_KEY = cfg.apiKey;
      }
      if (cfg.teamId) {
        process.env.LINEAR_TEAM_ID = cfg.teamId;
      }
    } catch {}
  }
}
loadConfigFallback();

// ─── Linear GraphQL Client ───────────────────────────────────────────────────

function linearGraphQL(query, variables = {}) {
  const apiKey = process.env.LINEAR_API_KEY || LINEAR_API_KEY;
  if (!apiKey) {
    throw new Error('LINEAR_API_KEY not configured. Set it in .env or linear-config.json');
  }

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const url = new URL('https://api.linear.app/graphql');
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Linear API error ${res.statusCode}: ${data}`));
        }
        const parsed = JSON.parse(data);
        if (parsed.errors) {
          return reject(new Error(`Linear GraphQL error: ${JSON.stringify(parsed.errors)}`));
        }
        resolve(parsed.data);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Tool Implementations ─────────────────────────────────────────────────────

const TOOLS = {
  linear_list_teams: {
    name: 'linear_list_teams',
    description: 'List all teams available in the Linear workspace',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async () => {
      const data = await linearGraphQL(`
        query { teams { nodes { id name key } } }
      `);
      return { content: [{ type: 'text', text: JSON.stringify(data.teams.nodes, null, 2) }] };
    },
  },

  linear_list_states: {
    name: 'linear_list_states',
    description: 'List all workflow states (columns) for a team',
    inputSchema: {
      type: 'object',
      properties: {
        teamId: { type: 'string', description: 'Team ID. Uses default if omitted.' },
      },
      required: [],
    },
    handler: async (args) => {
      const teamId = args?.teamId || DEFAULT_TEAM_ID;
      if (!teamId) throw new Error('teamId is required. Provide it or set LINEAR_TEAM_ID');
      const data = await linearGraphQL(
        `query ($teamId: String!) {
          team(id: $teamId) {
            states { nodes { id name type color position } }
          }
        }`,
        { teamId }
      );
      return { content: [{ type: 'text', text: JSON.stringify(data.team.states.nodes, null, 2) }] };
    },
  },

  linear_create_issue: {
    name: 'linear_create_issue',
    description: 'Create a new issue in Linear',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Issue title' },
        description: { type: 'string', description: 'Issue description in Markdown' },
        teamId: { type: 'string', description: 'Team ID. Uses default if omitted.' },
        priority: { type: 'number', description: '0=none, 1=urgent, 2=high, 3=medium, 4=low', default: 2 },
        estimate: { type: 'number', description: 'Story points estimate (0-100)' },
        stateId: { type: 'string', description: 'Initial workflow state ID. Defaults to Backlog.' },
        assigneeId: { type: 'string', description: 'User ID to assign' },
        parentId: { type: 'string', description: 'Parent issue ID (for sub-issues)' },
        labels: { type: 'array', items: { type: 'string' }, description: 'Label names to apply' },
      },
      required: ['title'],
    },
    handler: async (args) => {
      const teamId = args.teamId || DEFAULT_TEAM_ID;
      if (!teamId) throw new Error('teamId is required. Provide it or set LINEAR_TEAM_ID');

      const input = { title: args.title, teamId, description: args.description || '' };
      if (args.priority !== undefined) input.priority = args.priority;
      if (args.estimate !== undefined) input.estimate = args.estimate;
      if (args.stateId) input.stateId = args.stateId;
      if (args.assigneeId) input.assigneeId = args.assigneeId;
      if (args.parentId) input.parentId = args.parentId;

      const data = await linearGraphQL(
        `mutation ($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue { id identifier url title }
          }
        }`,
        { input }
      );

      if (!data.issueCreate.success) {
        throw new Error('Linear returned success=false');
      }

      // Apply labels if provided
      if (args.labels && args.labels.length > 0) {
        const issueId = data.issueCreate.issue.id;
        for (const labelName of args.labels) {
          try {
            await linearGraphQL(
              `mutation ($input: IssueLabelCreateInput!) {
                issueLabelCreate(input: $input) { success }
              }`,
              { input: { name: labelName, issueId } }
            );
          } catch {}
        }
      }

      return { content: [{ type: 'text', text: JSON.stringify(data.issueCreate.issue, null, 2) }] };
    },
  },

  linear_get_issue: {
    name: 'linear_get_issue',
    description: 'Get details of a single issue by ID or identifier (e.g. "GIG-42")',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Issue ID (e.g. "GIG-42" or UUID)' },
      },
      required: ['id'],
    },
    handler: async (args) => {
      const data = await linearGraphQL(
        `query ($id: String!) {
          issue(id: $id) {
            id identifier title description priority estimate
            state { id name type }
            assignee { id name }
            parent { id identifier title }
            children { nodes { id identifier title state { name } } }
            labels { nodes { name } }
            createdAt updatedAt
            url
          }
        }`,
        { id: args.id }
      );
      if (!data.issue) throw new Error(`Issue "${args.id}" not found`);
      return { content: [{ type: 'text', text: JSON.stringify(data.issue, null, 2) }] };
    },
  },

  linear_search_issues: {
    name: 'linear_search_issues',
    description: 'Search issues in a team, optionally filtered by state',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search text', default: '' },
        teamId: { type: 'string', description: 'Team ID. Uses default if omitted.' },
        stateFilter: { type: 'string', description: 'State ID to filter by (e.g. "Backlog" state ID)' },
        limit: { type: 'number', description: 'Max results', default: 20 },
      },
      required: [],
    },
    handler: async (args) => {
      const teamId = args.teamId || DEFAULT_TEAM_ID;
      if (!teamId) throw new Error('teamId is required. Provide it or set LINEAR_TEAM_ID');

      let filter = { team: { id: { eq: teamId } } };
      if (args.stateFilter) {
        filter.state = { id: { eq: args.stateFilter } };
      }
      if (args.query) {
        filter.title = { containsIgnoreCase: args.query };
      }

      const data = await linearGraphQL(
        `query ($filter: IssueFilter, $first: Int) {
          issues(filter: $filter, first: $first, orderBy: createdAt) {
            nodes {
              id identifier title priority estimate
              state { id name type }
              assignee { id name }
              createdAt url
            }
          }
        }`,
        { filter, first: args.limit || 20 }
      );

      return { content: [{ type: 'text', text: JSON.stringify(data.issues.nodes, null, 2) }] };
    },
  },

  linear_update_issue: {
    name: 'linear_update_issue',
    description: 'Update an issue (state, priority, assignee, estimate)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Issue identifier (e.g. "GIG-42")' },
        stateId: { type: 'string', description: 'New workflow state ID' },
        priority: { type: 'number', description: '0=none, 1=urgent, 2=high, 3=medium, 4=low' },
        assigneeId: { type: 'string', description: 'User ID to assign' },
        estimate: { type: 'number', description: 'Story points estimate' },
        title: { type: 'string', description: 'New title' },
        description: { type: 'string', description: 'New description' },
      },
      required: ['id'],
    },
    handler: async (args) => {
      const input = {};
      if (args.stateId) input.stateId = args.stateId;
      if (args.priority !== undefined) input.priority = args.priority;
      if (args.assigneeId) input.assigneeId = args.assigneeId;
      if (args.estimate !== undefined) input.estimate = args.estimate;
      if (args.title) input.title = args.title;
      if (args.description) input.description = args.description;

      const data = await linearGraphQL(
        `mutation ($id: String!, $input: IssueUpdateInput!) {
          issueUpdate(id: $id, input: $input) {
            success
            issue { id identifier title state { name } url }
          }
        }`,
        { id: args.id, input }
      );

      if (!data.issueUpdate.success) {
        throw new Error('Linear returned success=false');
      }

      return { content: [{ type: 'text', text: JSON.stringify(data.issueUpdate.issue, null, 2) }] };
    },
  },

  linear_add_comment: {
    name: 'linear_add_comment',
    description: 'Add a comment to an issue',
    inputSchema: {
      type: 'object',
      properties: {
        issueId: { type: 'string', description: 'Issue identifier (e.g. "GIG-42")' },
        body: { type: 'string', description: 'Comment body in Markdown' },
      },
      required: ['issueId', 'body'],
    },
    handler: async (args) => {
      const data = await linearGraphQL(
        `mutation ($input: CommentCreateInput!) {
          commentCreate(input: $input) { success comment { id body } }
        }`,
        { input: { issueId: args.issueId, body: args.body } }
      );

      return { content: [{ type: 'text', text: JSON.stringify(data.commentCreate, null, 2) }] };
    },
  },
};

// ─── MCP Protocol (JSON-RPC 2.0 over stdio) ──────────────────────────────────

const MCP_VERSION = '2024-11-05';

function sendMessage(msg) {
  const line = JSON.stringify(msg);
  process.stdout.write(line + '\n');
}

function handleRequest(msg) {
  const { id, method, params } = msg;
  const respond = (result) => sendMessage({ jsonrpc: '2.0', id, result });
  const respondError = (code, message, data) =>
    sendMessage({ jsonrpc: '2.0', id, error: { code, message, data } });

  try {
    switch (method) {
      case 'initialize':
        respond({
          protocolVersion: MCP_VERSION,
          capabilities: { tools: {} },
          serverInfo: { name: 'gigio-flow-linear-mcp', version: '1.0.0' },
        });
        break;

      case 'notifications/initialized':
        // No response needed for notifications
        break;

      case 'tools/list':
        respond({
          tools: Object.values(TOOLS).map(({ name, description, inputSchema }) => ({
            name,
            description,
            inputSchema,
          })),
        });
        break;

      case 'tools/call':
        (async () => {
          try {
            const tool = TOOLS[params.name];
            if (!tool) {
              return respondError(-32601, `Tool not found: ${params.name}`);
            }
            const result = await tool.handler(params.arguments || {});
            respond(result);
          } catch (err) {
            respondError(-32603, err.message, err.stack);
          }
        })();
        break;

      case 'ping':
        respond({});
        break;

      default:
        respondError(-32601, `Method not found: ${method}`);
    }
  } catch (err) {
    respondError(-32603, err.message, err.stack);
  }
}

// ─── Main Loop ────────────────────────────────────────────────────────────────

function startServer() {
  const apiKey = process.env.LINEAR_API_KEY || LINEAR_API_KEY;
  if (!apiKey) {
    console.error('[mcp-linear] WARNING: LINEAR_API_KEY is not configured.');
    console.error('[mcp-linear] Set it via environment variable or linear-config.json');
    console.error('[mcp-linear] The server will start but tools will fail until configured.');
  } else {
    console.error(`[mcp-linear] Server starting (Linear: ${apiKey.substring(0, 12)}...)`);
  }

  let buffer = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    // Keep the last incomplete line in the buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const msg = JSON.parse(trimmed);
        handleRequest(msg);
      } catch (err) {
        // Invalid JSON — ignore
        console.error('[mcp-linear] Invalid JSON received:', trimmed.substring(0, 100));
      }
    }
  });

  process.stdin.on('end', () => {
    process.exit(0);
  });
}

startServer();
