import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { generateAndSavePlan } from '../lib/planGenerator';

const text = {
  en: {
    title: 'AI Study Buddy',
    subtitle: 'Ask me anything about SAT prep — strategies, problem breakdowns, study plans, or resource recommendations.',
    placeholder: 'Ask about SAT strategies, problem solving, study plans...',
    send: '→',
    welcome: 'Hey! 👋 I\'m your SAT Study Buddy. I can help you with:\n\n• **Explain SAT concepts** — ask me about any math topic, reading strategy, or grammar rule\n• **Break down problems** — paste a question and I\'ll walk you through it step by step\n• **Build a study plan** — tell me your test date, current score, and goal\n• **Recommend resources** — I know every resource in our library\n\nWhat would you like help with?',
    welcomeRu: 'Привет! 👋 Я твой AI помощник для SAT. Я могу:\n\n• **Объяснить концепты SAT** — спроси о любой теме\n• **Разобрать задачу** — пришли вопрос и я разберу его пошагово\n• **Составить план** — скажи дату экзамена, текущий и целевой балл\n• **Порекомендовать ресурсы** — я знаю всю нашу библиотеку\n\nЧем помочь?',
    welcomePlan: "Hey! 👋 I'm ready to build your personalized study plan.\n\nI'll ask you a few quick questions so the plan actually fits your life — your schedule, your weak spots, how you like to study.\n\nReady? Click below to get started.",
    welcomePlanRu: 'Привет! 👋 Готов составить твой персональный план подготовки.\n\nЗадам несколько вопросов чтобы план реально подходил тебе — твоё расписание, слабые места, как тебе удобнее учиться.\n\nГотов? Нажми ниже.',
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
    loadingHistory: 'Loading your conversation history...',
    loadingHistoryRu: 'Загружаю историю переписки...',
  }
};

// How many past messages to load and send to AI (keeps context manageable)
const HISTORY_LIMIT = 40;

function formatMessage(text) {
  let formatted = text;
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/^• /gm, '<span class="chat-bullet">•</span> ');
  formatted = formatted.replace(/\n/g, '<br/>');
  return formatted;
}

const PLAN_UPDATE_RE = /\[\[PLAN_UPDATE\]\][\s\S]*?\[\[\/PLAN_UPDATE\]\]/g;

function AIChatBuddy({ language, user, profile, onProfileUpdate, setCurrentPage }) {
  const t = text.en;
  const noPlan = !profile?.plan_created;
  const welcomeContent = noPlan ? t.welcomePlan : t.welcome;
  const welcomeMessage = { role: 'assistant', content: welcomeContent };

  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(!!user);
  const [planJustCreated, setPlanJustCreated] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const latestProfileRef = useRef(profile);
  const planTasksRef = useRef(null);
  const scheduledDaysRef = useRef(null);
  const aiContentRef = useRef('');       // mirrors aiContent for cross-tab-switch recovery
  const isStreamingRef = useRef(false);  // mirrors isStreaming state

  const messagesContainerRef = useRef(null);

  // Restore streaming content when user returns to this tab
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isStreamingRef.current && aiContentRef.current) {
        const displayText = aiContentRef.current.replace(PLAN_UPDATE_RE, '').trim();
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, content: displayText }];
          }
          return prev;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Keep ref in sync so savePlan always has latest profile
  useEffect(() => { latestProfileRef.current = profile; }, [profile]);

  // ── Save plan to Dashboard ────────────────────────────────────────────────
  const savePlanToDashboard = useCallback(async () => {
    setSavingPlan(true);
    try {
      await generateAndSavePlan(latestProfileRef.current, user.id, planTasksRef.current, scheduledDaysRef.current);
      if (onProfileUpdate) {
        const today = new Date().toISOString().slice(0, 10);
        onProfileUpdate({
          ...latestProfileRef.current,
          plan_created: true,
          plan_start_date: today,
          scheduled_days: scheduledDaysRef.current ?? latestProfileRef.current.scheduled_days,
        });
      }
      setCurrentPage('dashboard');
    } catch (e) {
      console.error('Plan save failed', e);
    } finally {
      setSavingPlan(false);
    }
  }, [user.id, onProfileUpdate, setCurrentPage]);

  // ── Load history from Supabase on mount ───────────────────────────────────
  useEffect(() => {
    if (!user) return;

    supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(HISTORY_LIMIT)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          // Reverse so oldest first, prepend welcome message
          const history = data.reverse();
          setMessages([welcomeMessage, ...history]);
        }
        setHistoryLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Save a message to Supabase ────────────────────────────────────────────
  const saveMessage = useCallback(async (role, content) => {
    if (!user) return;
    await supabase.from('chat_messages').insert({ user_id: user.id, role, content });
  }, [user]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async (messageText) => {
    const userText = messageText || input.trim();
    if (!userText || isLoading) return;

    const userMessage = { role: 'user', content: userText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Save user message to Supabase immediately
    saveMessage('user', userText);

    // Skip welcome message (index 0) — UI only, not sent to AI
    const apiMessages = updatedMessages.slice(1).map(({ role, content }) => ({ role, content }));

    // Fetch live task stats to give AI real progress context
    let taskStats = null;
    if (user && profile?.plan_created) {
      const { data: allTasks } = await supabase
        .from('user_tasks').select('completed').eq('user_id', user.id);
      if (allTasks) {
        const total = allTasks.length;
        const completed = allTasks.filter(t => t.completed).length;
        const planStartDate = latestProfileRef.current.plan_start_date;
        const dayNum = planStartDate
          ? Math.max(1, Math.floor((Date.now() - new Date(planStartDate).getTime()) / 86400000) + 1)
          : 1;
        taskStats = { total, completed, dayNum };
      }
    }

    try {
      const API_BASE = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, language, profile, taskStats }),
      });

      if (!response.ok) throw new Error(`Server error ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let aiContent = '';
      let firstTextReceived = false;
      aiContentRef.current = '';
      isStreamingRef.current = true;

      // Keep isLoading=true (dots visible) until first real text arrives — no blank white bubble
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            isStreamingRef.current = false;
            setIsStreaming(false);
            const finalText = aiContent.replace(PLAN_UPDATE_RE, '').trim();
            if (finalText) saveMessage('assistant', finalText);

            const planMatch = aiContent.match(/\[\[PLAN_UPDATE\]\]([\s\S]*?)\[\[\/PLAN_UPDATE\]\]/);
            if (planMatch) {
              try {
                const planUpdate = JSON.parse(planMatch[1].trim());
                console.log('[Plan] parsed:', JSON.stringify(planUpdate).slice(0, 400));
                if (planUpdate.plan_created) setPlanJustCreated(true);
                const { plan_tasks, sessions_per_week, ...profileUpdate } = planUpdate;
                if (plan_tasks?.length) planTasksRef.current = plan_tasks;

                // Fallback: if AI omitted scheduled_days but gave sessions_per_week, generate defaults
                if (!profileUpdate.scheduled_days?.length && sessions_per_week) {
                  const defaults = { 1:[3], 2:[2,5], 3:[1,3,5], 4:[1,2,4,5], 5:[1,2,3,4,5], 6:[1,2,3,4,5,6], 7:[0,1,2,3,4,5,6] };
                  profileUpdate.scheduled_days = defaults[sessions_per_week] ?? [1,3,5];
                  console.log('[Plan] generated default scheduled_days:', profileUpdate.scheduled_days);
                }

                if (profileUpdate.scheduled_days?.length) scheduledDaysRef.current = profileUpdate.scheduled_days;
                console.log('[Plan] scheduledDaysRef set to:', scheduledDaysRef.current);

                if (user && onProfileUpdate) {
                  supabase.from('profiles').update(profileUpdate).eq('user_id', user.id)
                    .select().single()
                    .then(({ data: updated, error }) => {
                      console.log('[Plan] profile update result:', updated, error);
                      if (updated) onProfileUpdate(updated);
                    });
                }
              } catch (e) {
                console.error('[Plan] parse error:', e.message);
              }
            } else {
              console.warn('[Plan] PLAN_UPDATE block not found in response');
            }
            continue;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);

            if (parsed.planUpdate && !planTasksRef.current) {
              const { plan_tasks } = parsed.planUpdate;
              if (plan_tasks?.length) planTasksRef.current = plan_tasks;
            }

            if (parsed.text) {
              aiContent += parsed.text;
              aiContentRef.current = aiContent;
              const displayText = aiContent.replace(PLAN_UPDATE_RE, '').trim();

              if (!firstTextReceived) {
                // First text: switch from loading dots to streaming bubble in one render
                firstTextReceived = true;
                setIsLoading(false);
                setIsStreaming(true);
                setMessages(prev => [...prev, { role: 'assistant', content: displayText }]);
              } else {
                setMessages(prev => [
                  ...prev.slice(0, -1),
                  { role: 'assistant', content: displayText },
                ]);
              }
            }
          } catch (e) {
            if (e.message && !e.message.includes('JSON')) throw e;
          }
        }
      }
    } catch (error) {
      isStreamingRef.current = false;
      setIsLoading(false);
      setIsStreaming(false);
      const errorMsg = language === 'ru'
        ? 'Извини, что-то пошло не так. Попробуй снова.'
        : 'Sorry, something went wrong. Please try again.';
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last?.content === '') {
          return [...prev.slice(0, -1), { role: 'assistant', content: errorMsg }];
        }
        return [...prev, { role: 'assistant', content: errorMsg }];
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = noPlan
    ? ["Let's build my study plan →"]
    : (language === 'ru' ? t.suggestionsRu : t.suggestions);
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
                <h4 className="capability__title">{language === 'ru' ? 'Любой язык' : 'Any Language'}</h4>
                <p className="capability__desc">{language === 'ru' ? 'Пиши на любом языке — отвечу на нём же' : 'Ask in any language — I\'ll answer in the same'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-main">
          <div className="chat-messages" ref={messagesContainerRef}>

            {historyLoading ? (
              <div className="chat-history-loading">
                <div className="chat-typing"><span></span><span></span><span></span></div>
                <p>{language === 'ru' ? t.loadingHistoryRu : t.loadingHistory}</p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isLastAssistant = isStreaming && index === messages.length - 1 && msg.role === 'assistant';
                  return (
                    <div className={`chat-message chat-message--${msg.role}`} key={index}>
                      {msg.role === 'assistant' && (
                        <div className="chat-message__avatar">🤖</div>
                      )}
                      <div className={`chat-message__bubble${isLastAssistant ? ' chat-message__bubble--streaming' : ''}`}>
                        {isLastAssistant && !msg.content ? (
                          <div className="chat-typing"><span></span><span></span><span></span></div>
                        ) : (
                          <>
                            <div
                              className="chat-message__text"
                              dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                            />
                            {isLastAssistant && msg.content && <span className="chat-cursor" />}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

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
                        className={`chat-suggestion ${noPlan ? 'chat-suggestion--primary' : ''}`}
                        key={i}
                        onClick={() => sendMessage(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {planJustCreated && (
                  <div className="chat-save-plan">
                    <div className="chat-save-plan__inner">
                      <span className="chat-save-plan__icon">🎉</span>
                      <div>
                        <p className="chat-save-plan__title">
                          {language === 'ru' ? 'Твой план готов!' : 'Your plan is ready!'}
                        </p>
                        <p className="chat-save-plan__sub">
                          {language === 'ru'
                            ? 'Сохрани его в Dashboard — там будут задачи на каждый день.'
                            : "Save it to your Dashboard — you'll get daily tasks and progress tracking."}
                        </p>
                      </div>
                      <button
                        className="chat-save-plan__btn"
                        onClick={savePlanToDashboard}
                        disabled={savingPlan}
                      >
                        {savingPlan
                          ? (language === 'ru' ? 'Сохраняю...' : 'Saving...')
                          : (language === 'ru' ? 'Сохранить в Dashboard →' : 'Save to Dashboard →')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="chat-input-area">
            <p className="chat-disclaimer">
              {language === 'ru' ? t.disclaimerRu : t.disclaimer}
            </p>
            <div className="chat-input-wrapper">
              <textarea
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                rows={1}
                disabled={historyLoading}
              />
              <button
                className={`chat-send ${input.trim() ? 'chat-send--active' : ''}`}
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading || historyLoading}
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
