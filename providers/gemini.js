const { GoogleGenAI } = require('@google/genai');
const BaseProvider = require('./base');

class GeminiProvider extends BaseProvider {
  constructor(apiKey) {
    super();
    this.ai = new GoogleGenAI({ apiKey });
  }

  stream(messages, systemPrompt, { onChunk, onDone, onError, signal }) {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // @google/genai uses 'user'/'model' roles
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const run = async () => {
      const stream = await this.ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: systemPrompt,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      for await (const chunk of stream) {
        if (signal?.aborted) return;
        const text = chunk.text;
        if (text) onChunk(text);
      }
      onDone();
    };

    run().catch(onError);
  }
}

module.exports = GeminiProvider;
