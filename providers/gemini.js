const { GoogleGenAI } = require('@google/genai');
const BaseProvider = require('./base');

class GeminiProvider extends BaseProvider {
  constructor(apiKey) {
    super();
    this.ai = new GoogleGenAI({ apiKey });
  }

  stream(messages, systemPrompt, { image, onChunk, onDone, onError, signal }) {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // @google/genai uses 'user'/'model' roles
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Attach a photo (if any) to the most recent user turn
    if (image && image.data) {
      for (let i = contents.length - 1; i >= 0; i--) {
        if (contents[i].role === 'user') {
          contents[i].parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
          break;
        }
      }
    }

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
