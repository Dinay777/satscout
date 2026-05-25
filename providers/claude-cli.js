const { spawn } = require('child_process');
const BaseProvider = require('./base');

const CLAUDE_BINARY = process.env.CLAUDE_BINARY || 'claude';
const TIMEOUT_MS = parseInt(process.env.CLAUDE_TIMEOUT_MS || '90000');

class ClaudeCLIProvider extends BaseProvider {
  formatConversation(messages) {
    return messages
      .map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
      .join('\n\n');
  }

  stream(messages, systemPrompt, { onChunk, onDone, onError, signal }) {
    const prompt = this.formatConversation(messages);

    let proc = null;
    let killed = false;
    let timeout = null;
    let previousText = '';

    const cleanup = () => {
      if (proc && !killed) {
        killed = true;
        try { proc.kill('SIGTERM'); } catch (_) {}
        setTimeout(() => {
          try { proc.kill('SIGKILL'); } catch (_) {}
        }, 3000);
      }
      if (timeout) clearTimeout(timeout);
    };

    if (signal) {
      signal.addEventListener('abort', cleanup, { once: true });
    }

    try {
      proc = spawn(CLAUDE_BINARY, [
        '--print',
        '--verbose',
        '--output-format', 'stream-json',
        '--include-partial-messages',
        '--model', process.env.CLAUDE_MODEL || 'haiku',
        '--system-prompt', systemPrompt,
        '--tools', '',
        '--no-session-persistence',
        prompt,
      ], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env },
        cwd: '/tmp',  // avoid picking up ~/CLAUDE.md or project CLAUDE.md
      });

      timeout = setTimeout(() => {
        cleanup();
        onError(new Error('Request timed out after 90s'));
      }, TIMEOUT_MS);

      let buffer = '';

      proc.stdout.on('data', (chunk) => {
        if (killed) return;
        buffer += chunk.toString('utf8');

        // Process complete newline-delimited JSON lines
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const event = JSON.parse(trimmed);

            // Partial assistant message — stream the delta
            if (
              event.type === 'assistant' &&
              event.message?.content?.[0]?.type === 'text'
            ) {
              const currentText = event.message.content[0].text;
              const delta = currentText.slice(previousText.length);
              if (delta) {
                onChunk(delta);
                previousText = currentText;
              }
            }

            // Stream complete
            if (event.type === 'result' && event.subtype === 'success') {
              clearTimeout(timeout);
              if (signal) signal.removeEventListener('abort', cleanup);
              onDone();
            }

            // Claude-level error
            if (event.type === 'result' && event.is_error) {
              clearTimeout(timeout);
              if (signal) signal.removeEventListener('abort', cleanup);
              onError(new Error(event.result || 'Claude returned an error'));
            }
          } catch (_) {
            // non-JSON line (e.g. warnings) — ignore
          }
        }
      });

      proc.stderr.on('data', (chunk) => {
        console.error('[claude-cli]', chunk.toString().trim());
      });

      proc.on('error', (err) => {
        clearTimeout(timeout);
        if (!killed) onError(err);
      });

      proc.on('close', (code) => {
        clearTimeout(timeout);
        if (signal) signal.removeEventListener('abort', cleanup);
        // onDone already called via 'result' event; only handle unexpected exit
        if (!killed && code !== 0) {
          onError(new Error(`Claude process exited with code ${code}`));
        }
      });
    } catch (err) {
      onError(err);
    }

    return cleanup;
  }
}

module.exports = ClaudeCLIProvider;
