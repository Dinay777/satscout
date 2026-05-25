const BaseProvider = require('./base');

// Swap to this provider: npm install @google/generative-ai
// Set GEMINI_API_KEY in .env and change provider in server.js
class GeminiProvider extends BaseProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  stream(messages, systemPrompt, { onChunk, onDone, onError, signal }) {
    onError(new Error('GeminiProvider not yet implemented. Set GEMINI_API_KEY and uncomment code.'));

    // TODO: implement streaming with Gemini
    // const { GoogleGenerativeAI } = require('@google/generative-ai');
    // const genAI = new GoogleGenerativeAI(this.apiKey);
    // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: systemPrompt });
    // const chat = model.startChat({ history: ... });
    // const result = await chat.sendMessageStream(lastUserMessage);
    // for await (const chunk of result.stream) { onChunk(chunk.text()); }
    // onDone();
  }
}

module.exports = GeminiProvider;
