require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Anthropic = require('@anthropic-ai/sdk');
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);

const TOKEN = process.env.CLAUDE_BRIDGE_BOT_TOKEN;
const ALLOWED_USER_ID = process.env.CLAUDE_BRIDGE_USER_ID;
const PROJECT_DIR = '/Users/dinay/satscout';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!TOKEN || !ALLOWED_USER_ID) {
  console.error('Missing CLAUDE_BRIDGE_BOT_TOKEN or CLAUDE_BRIDGE_USER_ID in .env');
  process.exit(1);
}

if (!ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY in .env');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// Pending approval promises: requestId -> { resolve, chatId }
const pendingApprovals = new Map();
let activeTask = false;
let cancelRequested = false;

// ── Tools definition ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'read_file',
    description: 'Read the contents of a file',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute or project-relative path' },
        offset: { type: 'number', description: 'Line to start from (optional)' },
        limit: { type: 'number', description: 'Max lines to read (optional)' },
      },
      required: ['path'],
    },
  },
  {
    name: 'list_files',
    description: 'List files in a directory or matching a glob pattern',
    input_schema: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: 'Glob pattern, e.g. src/**/*.js' },
        directory: { type: 'string', description: 'Directory to list (optional)' },
      },
    },
  },
  {
    name: 'search_code',
    description: 'Search for a pattern in files using grep',
    input_schema: {
      type: 'object',
      properties: {
        pattern: { type: 'string' },
        path: { type: 'string', description: 'Directory or file to search in' },
        glob: { type: 'string', description: 'File glob filter, e.g. *.js' },
      },
      required: ['pattern'],
    },
  },
  {
    name: 'write_file',
    description: 'Write or overwrite a file completely',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'edit_file',
    description: 'Replace an exact string in a file',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        old_string: { type: 'string' },
        new_string: { type: 'string' },
      },
      required: ['path', 'old_string', 'new_string'],
    },
  },
  {
    name: 'run_bash',
    description: 'Run a shell command in the project directory',
    input_schema: {
      type: 'object',
      properties: {
        command: { type: 'string' },
      },
      required: ['command'],
    },
  },
];

// Tools that are auto-approved (read-only)
const AUTO_APPROVE = new Set(['read_file', 'list_files', 'search_code']);

// ── Tool execution ─────────────────────────────────────────────────────────────

async function executeTool(name, input) {
  const resolve = (p) => path.isAbsolute(p) ? p : path.join(PROJECT_DIR, p);

  if (name === 'read_file') {
    const content = fs.readFileSync(resolve(input.path), 'utf8');
    const lines = content.split('\n');
    const start = (input.offset || 1) - 1;
    const end = input.limit ? start + input.limit : lines.length;
    return lines.slice(start, end).map((l, i) => `${start + i + 1}\t${l}`).join('\n');
  }

  if (name === 'list_files') {
    const dir = input.directory ? resolve(input.directory) : PROJECT_DIR;
    const pattern = input.pattern || '*';
    const { stdout } = await execAsync(`find ${dir} -path "*/node_modules" -prune -o -name "${pattern.replace('**/', '')}" -print 2>/dev/null | head -50`);
    return stdout.trim() || '(no files found)';
  }

  if (name === 'search_code') {
    const searchPath = input.path ? resolve(input.path) : PROJECT_DIR;
    const globFlag = input.glob ? `--include="${input.glob}"` : '';
    try {
      const { stdout } = await execAsync(`grep -r ${globFlag} -n --exclude-dir=node_modules --exclude-dir=.git -l "${input.pattern}" ${searchPath} 2>/dev/null | head -20`);
      if (!stdout.trim()) return '(no matches)';
      // Get a few lines of context
      const { stdout: ctx } = await execAsync(`grep -r ${globFlag} -n --exclude-dir=node_modules --exclude-dir=.git "${input.pattern}" ${searchPath} 2>/dev/null | head -30`);
      return ctx.trim();
    } catch { return '(no matches)'; }
  }

  if (name === 'write_file') {
    const filePath = resolve(input.path);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, input.content, 'utf8');
    return `Written: ${input.path}`;
  }

  if (name === 'edit_file') {
    const filePath = resolve(input.path);
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes(input.old_string)) {
      return `ERROR: old_string not found in ${input.path}`;
    }
    fs.writeFileSync(filePath, content.replace(input.old_string, input.new_string), 'utf8');
    return `Edited: ${input.path}`;
  }

  if (name === 'run_bash') {
    try {
      const { stdout, stderr } = await execAsync(input.command, { cwd: PROJECT_DIR, timeout: 30000 });
      return (stdout + stderr).trim() || '(no output)';
    } catch (e) {
      return `ERROR: ${e.message.slice(0, 500)}`;
    }
  }

  return 'Unknown tool';
}

// ── Permission prompt ─────────────────────────────────────────────────────────

async function askPermission(chatId, toolName, input) {
  const requestId = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

  let text = `🔧 *${toolName}*`;
  if (toolName === 'run_bash') {
    text += `\n\`\`\`\n${input.command}\n\`\`\``;
  } else if (toolName === 'write_file') {
    text += `\n📄 \`${input.path}\`\n\`\`\`\n${(input.content || '').slice(0, 400)}${input.content?.length > 400 ? '\n…' : ''}\n\`\`\``;
  } else if (toolName === 'edit_file') {
    text += `\n📄 \`${input.path}\`\n\`\`\`diff\n- ${(input.old_string || '').slice(0, 200)}\n+ ${(input.new_string || '').slice(0, 200)}\n\`\`\``;
  } else {
    text += `\n\`\`\`json\n${JSON.stringify(input, null, 2).slice(0, 400)}\n\`\`\``;
  }

  await bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Allow', callback_data: `allow:${requestId}` },
        { text: '❌ Deny',  callback_data: `deny:${requestId}`  },
      ]],
    },
  });

  return new Promise((resolve) => {
    pendingApprovals.set(requestId, { resolve, chatId });
    setTimeout(() => {
      if (pendingApprovals.has(requestId)) {
        pendingApprovals.delete(requestId);
        bot.sendMessage(chatId, '⏱ Timed out — denied.').catch(() => {});
        resolve(false);
      }
    }, 10 * 60 * 1000);
  });
}

// ── Core: agentic loop ────────────────────────────────────────────────────────

async function runTask(chatId, userPrompt) {
  activeTask = true;
  cancelRequested = false;

  const statusMsg = await bot.sendMessage(chatId, '⏳ Thinking…');

  const messages = [{ role: 'user', content: userPrompt }];

  const SYSTEM = `You are Claude Code running on the user's Mac in project directory ${PROJECT_DIR}.
Help implement their coding tasks. Be concise in explanations.
When done, give a short summary of what you changed.`;

  try {
    while (!cancelRequested) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8096,
        system: SYSTEM,
        tools: TOOLS,
        messages,
      });

      // Collect text blocks to send
      const textBlocks = response.content.filter(b => b.type === 'text');
      const toolBlocks = response.content.filter(b => b.type === 'tool_use');

      if (textBlocks.length) {
        const text = textBlocks.map(b => b.text).join('');
        await sendChunked(chatId, text);
      }

      if (response.stop_reason === 'end_turn' || toolBlocks.length === 0) break;

      // Process tool calls
      messages.push({ role: 'assistant', content: response.content });

      const toolResults = [];

      for (const tool of toolBlocks) {
        if (cancelRequested) {
          toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: 'Cancelled by user' });
          continue;
        }

        let allowed = true;
        if (!AUTO_APPROVE.has(tool.name)) {
          // Update status
          await bot.editMessageText(`⏳ Waiting for approval: ${tool.name}`, {
            chat_id: chatId, message_id: statusMsg.message_id,
          }).catch(() => {});
          allowed = await askPermission(chatId, tool.name, tool.input);
        }

        let result;
        if (allowed) {
          await bot.editMessageText(`⚙️ Running: ${tool.name}…`, {
            chat_id: chatId, message_id: statusMsg.message_id,
          }).catch(() => {});
          try {
            result = await executeTool(tool.name, tool.input);
          } catch (e) {
            result = `ERROR: ${e.message}`;
          }
        } else {
          result = 'Tool denied by user.';
        }

        toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: result });
      }

      messages.push({ role: 'user', content: toolResults });

      await bot.editMessageText('⏳ Thinking…', {
        chat_id: chatId, message_id: statusMsg.message_id,
      }).catch(() => {});
    }

    await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
    if (cancelRequested) await bot.sendMessage(chatId, '🛑 Cancelled.');
    else await bot.sendMessage(chatId, '✅ Done');

  } catch (e) {
    await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
    await bot.sendMessage(chatId, `❌ ${e.message}`);
  } finally {
    activeTask = false;
  }
}

// ── Telegram handlers ─────────────────────────────────────────────────────────

bot.on('message', async (msg) => {
  if (msg.from.id.toString() !== ALLOWED_USER_ID) return;
  const chatId = msg.chat.id;
  const text = msg.text?.trim();
  if (!text) return;

  if (text.startsWith('/status')) { await gitStatus(chatId); return; }
  if (text.startsWith('/diff'))   { await gitDiff(chatId);   return; }
  if (text.startsWith('/push'))   { await gitPush(chatId, text.slice(5).trim()); return; }
  if (text.startsWith('/cancel')) {
    if (activeTask) { cancelRequested = true; }
    else await bot.sendMessage(chatId, 'Nothing running.');
    return;
  }
  if (text === '/help') {
    await bot.sendMessage(chatId,
      '*Claude Code Bridge*\n\n' +
      'Send any task → Claude executes on your Mac\n\n' +
      '*Commands:*\n' +
      '/status — git status\n' +
      '/diff — what changed\n' +
      '/push [message] — commit all & push\n' +
      '/cancel — stop current task\n' +
      '/help — this message',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  if (activeTask) {
    await bot.sendMessage(chatId, '⏳ Task in progress. Send /cancel to stop.');
    return;
  }

  await runTask(chatId, text);
});

bot.on('callback_query', async (query) => {
  if (query.from.id.toString() !== ALLOWED_USER_ID) return;

  const colonIdx = query.data.indexOf(':');
  const action = query.data.slice(0, colonIdx);
  const requestId = query.data.slice(colonIdx + 1);
  const pending = pendingApprovals.get(requestId);

  if (!pending) {
    await bot.answerCallbackQuery(query.id, { text: 'Expired' });
    return;
  }

  await bot.answerCallbackQuery(query.id, { text: action === 'allow' ? '✅' : '❌' });
  await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
    chat_id: pending.chatId,
    message_id: query.message.message_id,
  }).catch(() => {});

  pending.resolve(action === 'allow');
  pendingApprovals.delete(requestId);
});

// ── Git helpers ───────────────────────────────────────────────────────────────

async function gitStatus(chatId) {
  try {
    const out = execSync('git status --short', { cwd: PROJECT_DIR }).toString().trim();
    await bot.sendMessage(chatId, `\`\`\`\n${out || 'Working tree clean'}\n\`\`\``, { parse_mode: 'Markdown' });
  } catch (e) { await bot.sendMessage(chatId, `❌ ${e.message}`); }
}

async function gitDiff(chatId) {
  try {
    const out = execSync('git diff --stat HEAD', { cwd: PROJECT_DIR }).toString().trim();
    await sendChunked(chatId, `\`\`\`\n${out || 'No changes'}\n\`\`\``);
  } catch (e) { await bot.sendMessage(chatId, `❌ ${e.message}`); }
}

async function gitPush(chatId, commitMsg) {
  const msg = commitMsg || 'Update from mobile';
  try {
    execSync('git add -A', { cwd: PROJECT_DIR });
    const diff = execSync('git diff --cached --stat', { cwd: PROJECT_DIR }).toString().trim();
    if (!diff) { await bot.sendMessage(chatId, 'Nothing to commit.'); return; }
    execSync(`git commit -m "${msg.replace(/"/g, "'")}"`, { cwd: PROJECT_DIR });
    const pushOut = execSync('git push', { cwd: PROJECT_DIR }).toString().trim();
    await bot.sendMessage(chatId, `✅ Pushed\n\`\`\`\n${diff}\n\`\`\``, { parse_mode: 'Markdown' });
  } catch (e) {
    await bot.sendMessage(chatId, `❌ Push failed:\n\`${e.message.slice(0, 400)}\``, { parse_mode: 'Markdown' });
  }
}

async function sendChunked(chatId, text) {
  const MAX = 4000;
  for (let i = 0; i < text.length; i += MAX) {
    await bot.sendMessage(chatId, text.slice(i, i + MAX));
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────

console.log('🤖 Claude Code bridge running…');
bot.sendMessage(ALLOWED_USER_ID, '🤖 Bridge online. Send a task or /help.').catch(() => {});
