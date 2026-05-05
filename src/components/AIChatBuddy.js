import React, { useState, useRef, useEffect } from 'react';

const text = {
  en: {
    title: 'AI Study Buddy',
    subtitle: 'Ask me anything about SAT prep — strategies, problem breakdowns, study plans, or resource recommendations.',
    placeholder: 'Ask about SAT strategies, problem solving, study plans...',
    send: '→',
    thinking: 'Thinking...',
    welcome: 'Hey! 👋 I\'m your SAT Study Buddy. I can help you with:\n\n• **Explain SAT concepts** — ask me about any math topic, reading strategy, or grammar rule\n• **Break down problems** — paste a question and I\'ll walk you through it step by step\n• **Build a study plan** — tell me your test date, current score, and goal\n• **Recommend resources** — I know every resource in our library\n\nWhat would you like help with?',
    welcomeRu: 'Привет! 👋 Я твой AI помощник для SAT. Я могу:\n\n• **Объяснить концепты SAT** — спроси о любой теме\n• **Разобрать задачу** — пришли вопрос и я разберу его пошагово\n• **Составить план** — скажи дату экзамена, текущий и целевой балл\n• **Порекомендовать ресурсы** — я знаю всю нашу библиотеку\n\nЧем помочь?',
    suggestions: [
      'How should I start preparing for the SAT?',
      'Explain SAT Reading strategies',
      'I have 2 months until my test. Make me a plan.',
      'What are the best free resources?',
    ],
    suggestionsRu: [
      'С чего начать подготовку к SAT?',
      'Объясни стратегии для SAT Reading',
      'У меня 2 месяца до экзамена. Составь план.',
      'Какие лучшие бесплатные ресурсы?',
    ],
    disclaimer: 'AI can make mistakes. Verify important information.',
    disclaimerRu: 'AI может ошибаться. Проверяйте важную информацию.',
  }
};

function formatMessage(text) {
  // Simple markdown-like formatting
  let formatted = text;
  // Bold
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Bullet points
  formatted = formatted.replace(/^• /gm, '<span class="chat-bullet">•</span> ');
  // Line breaks
  formatted = formatted.replace(/\n/g, '<br/>');
  return formatted;
}

function AIChatBuddy({ language }) {
  const t = text.en;
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: language === 'ru' ? t.welcomeRu : t.welcome,
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (placeholder until API is connected)
    setTimeout(() => {
      const responses = {
        default: language === 'ru' 
          ? '🔧 AI Study Buddy пока в режиме настройки. Скоро здесь будет полноценный AI-помощник, который сможет разбирать задачи, объяснять концепты и составлять планы подготовки к SAT!\n\nА пока — загляни в нашу библиотеку ресурсов, там собраны лучшие материалы для подготовки.'
          : '🔧 AI Study Buddy is being set up. Soon you\'ll have a full AI tutor here that can break down problems, explain concepts, and build personalized SAT study plans!\n\nIn the meantime — check out our Resource Library for the best curated SAT prep materials.',
      };

      const aiMessage = {
        role: 'assistant',
        content: responses.default,
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestion = (suggestion) => {
    sendMessage(suggestion);
  };

  const suggestions = language === 'ru' ? t.suggestionsRu : t.suggestions;
  const showSuggestions = messages.length <= 1;

  return (
    <section className="chat-page">
      <div className="chat-container">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <div className="chat-sidebar__header">
            <div className="chat-sidebar__icon">🤖</div>
            <div>
              <h2 className="chat-sidebar__title">{t.title}</h2>
              <p className="chat-sidebar__subtitle">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="chat-sidebar__capabilities">
            <div className="capability">
              <span className="capability__icon">📝</span>
              <div>
                <h4 className="capability__title">{language === 'ru' ? 'Разбор задач' : 'Problem Breakdown'}</h4>
                <p className="capability__desc">{language === 'ru' ? 'Пришли задачу — разберу пошагово' : 'Paste any SAT question for a step-by-step solution'}</p>
              </div>
            </div>
            <div className="capability">
              <span className="capability__icon">📚</span>
              <div>
                <h4 className="capability__title">{language === 'ru' ? 'Рекомендации' : 'Smart Recommendations'}</h4>
                <p className="capability__desc">{language === 'ru' ? 'Подберу ресурсы под твои нужды' : 'Get personalized resource suggestions'}</p>
              </div>
            </div>
            <div className="capability">
              <span className="capability__icon">🗓️</span>
              <div>
                <h4 className="capability__title">{language === 'ru' ? 'План подготовки' : 'Study Plans'}</h4>
                <p className="capability__desc">{language === 'ru' ? 'Персональный план по неделям' : 'Custom week-by-week prep schedule'}</p>
              </div>
            </div>
            <div className="capability">
              <span className="capability__icon">🌍</span>
              <div>
                <h4 className="capability__title">{language === 'ru' ? 'Два языка' : 'Bilingual'}</h4>
                <p className="capability__desc">{language === 'ru' ? 'Отвечаю на русском и английском' : 'Ask in English or Russian'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-main">
          <div className="chat-messages" ref={messagesContainerRef}>
            {messages.map((msg, index) => (
              <div className={`chat-message chat-message--${msg.role}`} key={index}>
                {msg.role === 'assistant' && (
                  <div className="chat-message__avatar">🤖</div>
                )}
                <div className="chat-message__bubble">
                  <div 
                    className="chat-message__text"
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="chat-message chat-message--assistant">
                <div className="chat-message__avatar">🤖</div>
                <div className="chat-message__bubble">
                  <div className="chat-typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}

            {showSuggestions && (
              <div className="chat-suggestions">
                {suggestions.map((s, i) => (
                  <button 
                    className="chat-suggestion" 
                    key={i}
                    onClick={() => handleSuggestion(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <p className="chat-disclaimer">
              {language === 'ru' ? t.disclaimerRu : t.disclaimer}
            </p>
            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                rows={1}
              />
              <button 
                className={`chat-send ${input.trim() ? 'chat-send--active' : ''}`}
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
              >
                {t.send}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIChatBuddy;
