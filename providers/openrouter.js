const BaseProvider = require('./base');

// To activate: no extra npm install needed (uses fetch)
// Set OPENROUTER_API_KEY in .env
// In server.js: const provider = new OpenRouterProvider(process.env.OPENROUTER_API_KEY);
class OpenRouterProvider extends BaseProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.model = process.env.OPENROUTER_MODEL || 'google/gemini-flash-1.5';
  }

  stream(messages, systemPrompt, { onChunk, onDone, onError, signal }) {
    const run = async () => {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://satscout.org',
        },
        body: JSON.stringify({
          model: this.model,
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
        }),
        signal,
      });

      if (!res.ok) throw new Error(`OpenRouter error: ${res.status} ${await res.text()}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') { onDone(); return; }
          try {
            const json = JSON.parse(data);
            const text = json.choices?.[0]?.delta?.content;
            if (text) onChunk(text);
          } catch (_) {}
        }
      }
      onDone();
    };

    run().catch(err => {
      if (err.name === 'AbortError') return;
      onError(err);
    });
  }
}

module.exports = OpenRouterProvider;
