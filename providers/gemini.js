const { GoogleGenerativeAI } = require('@google/generative-ai');
const BaseProvider = require('./base');

class GeminiProvider extends BaseProvider {
  constructor(apiKey) {
    super();
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  stream(messages, systemPrompt, { onChunk, onDone, onError, signal }) {
    const model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    // Gemini uses 'user'/'model' roles, not 'user'/'assistant'
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const lastMessage = messages[messages.length - 1].content;

    const run = async () => {
      const chat = model.startChat({ history });
      const result = await chat.sendMessageStream(lastMessage);

      for await (const chunk of result.stream) {
        if (signal?.aborted) return;
        const text = chunk.text();
        if (text) onChunk(text);
      }
      onDone();
    };

    run().catch(onError);
  }
}

module.exports = GeminiProvider;
