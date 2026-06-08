const BaseProvider = require('./base');

// To activate: npm install @google/generative-ai
// Set GEMINI_API_KEY in .env
// In server.js: const provider = new GeminiProvider(process.env.GEMINI_API_KEY);
class GeminiProvider extends BaseProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  stream(messages, systemPrompt, { onChunk, onDone, onError, signal }) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
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
