import React, { useState, useRef, useEffect, useCallback } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { supabase } from '../lib/supabase';
import { generateAndSavePlan } from '../lib/planGenerator';

const text = {
  en: {
    title: 'AI Study Buddy',
    subtitle: 'Ask me anything about SAT prep — strategies, problem breakdowns, study plans, or resource recommendations.',
    placeholder: 'Ask about SAT strategies, problem solving, study plans...',
    send: '→',
    welcome: 'Hey! 👋 I\'m your SAT Study Buddy. I can help you with:\n\n• **Explain SAT concepts** — ask me about any math topic, reading strategy, or grammar rule\n• **Break down problems** — paste a question and I\'ll walk you through it step by step\n• **Build a study plan** — tell me your test date, current score, and goal\n• **Recommend resources** — I know every resource in our library\n\nWhat would you like help with?',
    welcomePlan: "Hey! 👋 I'm ready to build your personalized study plan.\n\nI'll ask you a few quick questions so the plan actually fits your life — your schedule, your weak spots, how you like to study.\n\nReady? Click below to get started.",
    suggestions: [
      'How should I start preparing for the SAT?',
      'Explain SAT Reading strategies',
      'I have 2 months until my test. Make me a plan.',
      'What are the best free resources?',
    ],
    disclaimer: 'AI can make mistakes. Verify important information.',
    loadingHistory: 'Loading your conversation history...',
  },
  ru: {
    title: 'AI Помощник SAT',
    subtitle: 'Задай любой вопрос о SAT — стратегии, разбор задач, планы подготовки или рекомендации по ресурсам.',
    placeholder: 'Спроси о стратегиях SAT, разборе задач, планах...',
    send: '→',
    welcome: 'Привет! 👋 Я твой AI помощник для SAT. Я могу:\n\n• **Объяснить концепты SAT** — спроси о любой теме\n• **Разобрать задачу** — пришли вопрос и я разберу его пошагово\n• **Составить план** — скажи дату экзамена, текущий и целевой балл\n• **Порекомендовать ресурсы** — я знаю всю нашу библиотеку\n\nЧем помочь?',
    welcomePlan: 'Привет! 👋 Готов составить твой персональный план подготовки.\n\nЗадам несколько вопросов чтобы план реально подходил тебе — твоё расписание, слабые места, как тебе удобнее учиться.\n\nГотов? Нажми ниже.',
    suggestions: [
      'С чего начать подготовку к SAT?',
      'Объясни стратегии для SAT Reading',
      'У меня 2 месяца до экзамена. Составь план.',
      'Какие лучшие бесплатные ресурсы?',
    ],
    disclaimer: 'AI может ошибаться. Проверяйте важную информацию.',
    loadingHistory: 'Загружаю историю переписки...',
  },
};

// How many past messages to load and send to AI (keeps context manageable)
const HISTORY_LIMIT = 40;

// Render a LaTeX expression to an HTML string. Falls back to the raw
// expression if KaTeX can't parse it (e.g. malformed input).
function renderMath(expr, displayMode) {
  try {
    return katex.renderToString(expr.trim(), {
      displayMode,
      throwOnError: false,
      output: 'html',
    });
  } catch {
    return expr;
  }
}

function formatMessage(text) {
  // Pull math out first so the markdown/newline passes below can't corrupt
  // LaTeX. Only complete delimiter pairs are matched — a half-streamed
  // "$$a^2 + b^2" with no closing "$$" is left untouched until it arrives.
  const mathBlocks = [];
  const stash = (html) => {
    const token = `@@MATH${mathBlocks.length}@@`;
    mathBlocks.push(html);
    return token;
  };

  let formatted = text;
  formatted = formatted.replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => stash(renderMath(expr, true)));
  formatted = formatted.replace(/\\\[([\s\S]+?)\\\]/g, (_, expr) => stash(renderMath(expr, true)));
  formatted = formatted.replace(/\$(?!\$)([^\n$]+?)\$/g, (_, expr) => stash(renderMath(expr, false)));
  formatted = formatted.replace(/\\\(([\s\S]+?)\\\)/g, (_, expr) => stash(renderMath(expr, false)));

  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/^• /gm, '<span class="chat-bullet">•</span> ');
  formatted = formatted.replace(/\n/g, '<br/>');

  // Re-insert rendered math (KaTeX output is self-contained HTML).
  formatted = formatted.replace(/@@MATH(\d+)@@/g, (_, i) => mathBlocks[Number(i)]);
  return formatted;
}

const PLAN_UPDATE_RE = /\[\[PLAN_UPDATE\]\][\s\S]*?\[\[\/PLAN_UPDATE\]\]/g;
// Strips incomplete [[PLAN_UPDATE]] blocks still streaming (no closing tag yet)
const PLAN_UPDATE_PARTIAL_RE = /\[\[PLAN_UPDATE\]\][\s\S]*$/;

function AIChatBuddy({ language, user, profile, onProfileUpdate, setCurrentPage, pendingMessage, onPendingMessageSent }) {
  const t = language === 'ru' ? text.ru : text.en;
  const noPlan = !profile?.plan_created;
  const welcomeContent = noPlan ? t.welcomePlan : t.welcome;
  const welcomeMessage = { role: 'assistant', content: welcomeContent };

  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(!!user);
  const [planJustCreated, setPlanJustCreated] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const autoSaveAttempted = useRef(false); // ensures the auto-save fires once per plan
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
        const displayText = aiContentRef.current.replace(PLAN_UPDATE_RE, '').replace(PLAN_UPDATE_PARTIAL_RE, '').trim();
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
  // Pass navigate=false to persist the plan silently (auto-save) without yanking
  // the student out of the chat; navigate=true also jumps to the Dashboard.
  const savePlanToDashboard = useCallback(async (navigate = true) => {
    setSavingPlan(true);
    try {
      await Promise.race([
        generateAndSavePlan(latestProfileRef.current, user.id, planTasksRef.current, scheduledDaysRef.current),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Save timed out — please try again')), 30000)),
      ]);
      if (onProfileUpdate) {
        const _d = new Date();
        const today = `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`;
        onProfileUpdate({
          ...latestProfileRef.current,
          plan_created: true,
          plan_start_date: today,
          scheduled_days: scheduledDaysRef.current ?? latestProfileRef.current.scheduled_days,
        });
      }
      setPlanSaved(true);
      if (navigate) setCurrentPage('dashboard');
    } catch (e) {
      console.error('Plan save failed', e);
    } finally {
      setSavingPlan(false);
    }
  }, [user.id, onProfileUpdate, setCurrentPage]);

  // Auto-save the plan as soon as the AI finishes building it, so it can never
  // be lost in the chat. Fires once per plan (reset on rebuild).
  useEffect(() => {
    if (planJustCreated && !autoSaveAttempted.current && !savingPlan) {
      autoSaveAttempted.current = true;
      savePlanToDashboard(false);
    }
  }, [planJustCreated, savingPlan, savePlanToDashboard]);

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
      })
      .catch(() => setHistoryLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Auto-send pending message from Dashboard ─────────────────────────────
  useEffect(() => {
    if (pendingMessage && !historyLoading && !isLoading) {
      sendMessage(pendingMessage);
      if (onPendingMessageSent) onPendingMessageSent();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMessage, historyLoading]);

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
          ? (() => {
              const [y, m, day] = planStartDate.split('-').map(Number);
              const start = new Date(y, m - 1, day); start.setHours(0,0,0,0);
              const now = new Date(); now.setHours(0,0,0,0);
              return Math.max(1, Math.floor((now - start) / 86400000) + 1);
            })()
          : 1;
        taskStats = { total, completed, dayNum };
      }
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const loginMsg = language === 'ru'
          ? 'Пожалуйста, войди в аккаунт чтобы использовать AI помощника.'
          : 'Please log in to use the AI Study Buddy.';
        setIsLoading(false);
        setMessages(prev => [...prev, { role: 'assistant', content: loginMsg }]);
        return;
      }

      const API_BASE = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: apiMessages, language, profile, taskStats }),
      });

      if (response.status === 401) {
        const reloginMsg = language === 'ru'
          ? 'Сессия истекла. Пожалуйста, войди снова.'
          : 'Your session has expired. Please log in again.';
        setIsLoading(false);
        setMessages(prev => [...prev, { role: 'assistant', content: reloginMsg }]);
        return;
      }

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
            setIsLoading(false);
            const finalText = aiContent.replace(PLAN_UPDATE_RE, '').trim();
            if (finalText) saveMessage('assistant', finalText);

            const planMatch = aiContent.match(/\[\[PLAN_UPDATE\]\]([\s\S]*?)\[\[\/PLAN_UPDATE\]\]/);
            if (planMatch) {
              try {
                const planUpdate = JSON.parse(planMatch[1].trim());
                console.log('[Plan] parsed:', JSON.stringify(planUpdate).slice(0, 400));
                if (planUpdate.plan_created) setPlanJustCreated(true);
                const { plan_tasks, sessions_per_week, plan_created, ...profileUpdate } = planUpdate;
                if (plan_tasks?.length) planTasksRef.current = plan_tasks;

                // Always ensure scheduled_days is set when plan is created
                if (!profileUpdate.scheduled_days?.length && plan_created) {
                  const defaults = { 1:[3], 2:[2,5], 3:[1,3,5], 4:[1,2,4,5], 5:[1,2,3,4,5], 6:[1,2,3,4,5,6], 7:[0,1,2,3,4,5,6] };
                  profileUpdate.scheduled_days = defaults[sessions_per_week] ?? [1,3,5];
                }

                if (profileUpdate.scheduled_days?.length) scheduledDaysRef.current = profileUpdate.scheduled_days;

                // Save non-plan fields immediately (score, target, etc.) — but NOT plan_created
                // plan_created is only set when user clicks "Save to Dashboard" and tasks are saved
                const { scheduled_days: _sd, ...immediateUpdate } = profileUpdate;
                if (user && Object.keys(immediateUpdate).length > 0) {
                  supabase.from('profiles').update(immediateUpdate).eq('user_id', user.id)
                    .select().single()
                    .then(({ data: updated }) => { if (updated) onProfileUpdate(updated); });
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
              const displayText = aiContent.replace(PLAN_UPDATE_RE, '').replace(PLAN_UPDATE_PARTIAL_RE, '').trim();

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
      // Stream closed — ensure loading state is reset if [DONE] was never received
      if (isStreamingRef.current) {
        isStreamingRef.current = false;
        setIsStreaming(false);
        setIsLoading(false);
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
    ? [language === 'ru' ? 'Составить мой план подготовки →' : "Let's build my study plan →"]
    : t.suggestions;
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
                <p>{t.loadingHistory}</p>
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
                      <span className="chat-save-plan__icon">{savingPlan ? '⏳' : '🎉'}</span>
                      <div>
                        <p className="chat-save-plan__title">
                          {savingPlan
                            ? (language === 'ru' ? 'Сохраняю план...' : 'Saving your plan...')
                            : planSaved
                              ? (language === 'ru' ? 'План сохранён в Dashboard!' : 'Saved to your Dashboard!')
                              : (language === 'ru' ? 'Твой план готов!' : 'Your plan is ready!')}
                        </p>
                        <p className="chat-save-plan__sub">
                          {language === 'ru'
                            ? 'Задачи уже на дашборде. Можешь открыть его или перестроить план.'
                            : "Your daily tasks are on the Dashboard. Open it, or rebuild the plan."}
                        </p>
                      </div>
                      <div className="chat-save-plan__actions">
                        <button
                          className="chat-save-plan__btn"
                          onClick={() => planSaved ? setCurrentPage('dashboard') : savePlanToDashboard(true)}
                          disabled={savingPlan}
                        >
                          {language === 'ru' ? 'Открыть Dashboard →' : 'Go to Dashboard →'}
                        </button>
                        <button
                          className="chat-save-plan__btn chat-save-plan__btn--ghost"
                          onClick={() => {
                            setPlanJustCreated(false);
                            setPlanSaved(false);
                            autoSaveAttempted.current = false;
                            sendMessage(language === 'ru' ? 'Давай перестроим план заново' : "Let's rebuild my plan from scratch");
                          }}
                          disabled={savingPlan}
                        >
                          {language === 'ru' ? 'Перестроить план' : 'Rebuild plan'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="chat-input-area">
            <p className="chat-disclaimer">
              {t.disclaimer}
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
                disabled={!input.trim() || isLoading || historyLoading || !user}
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
