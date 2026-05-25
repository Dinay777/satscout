class BaseProvider {
  // messages: [{role: 'user'|'assistant', content: string}]
  // onChunk(text): called for each streaming token
  // onDone(): called when stream completes
  // onError(err): called on error
  // signal: AbortSignal for cancellation
  stream(messages, systemPrompt, { onChunk, onDone, onError, signal }) {
    throw new Error('stream() must be implemented by provider');
  }
}

module.exports = BaseProvider;
