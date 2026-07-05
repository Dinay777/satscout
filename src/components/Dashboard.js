import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  getDaysUntilTest,
  getCurrentScoreNum,
  getGreeting,
  getWeekNumber,
  getTodaySessionNumber,
  getLastSessionDate,
  getPrevSessionDate,
  getNextSessionDayName,
  getWeekCalendar,
  DAY_SHORT_EN,
  DAY_SHORT_RU,
  localToday,
} from '../lib/studyPlan';

const TYPE_META = {
  video:    { icon: '🎬', label: 'Video',    color: 'blue'   },
  read:     { icon: '📖', label: 'Read',     color: 'orange' },
  practice: { icon: '✏️', label: 'Practice', color: 'green'  },
};

const OPTIONAL_TASKS = [
  { title: 'Review 5 vocabulary words', resource: 'Quizlet', url: 'https://quizlet.com/subject/sat-vocabulary/', duration: 3 },
  { title: 'Revisit 1 mistake from your last session', resource: 'Your notes', url: null, duration: 5 },
  { title: 'Watch one short SAT tip video', resource: 'SupertutorTV', url: 'https://www.youtube.com/@SupertutorTV', duration: 4 },
  { title: 'Read 1 paragraph from a classic novel', resource: 'Project Gutenberg', url: 'https://www.gutenberg.org', duration: 5 },
  { title: 'Skim your study plan summary', resource: 'SATScout', url: null, duration: 2 },
];

const OPTIONAL_TASKS_RU = [
  { title: 'Повтори 5 слов по вокабуляру', resource: 'Quizlet', url: 'https://quizlet.com/subject/sat-vocabulary/', duration: 3 },
  { title: 'Разбери 1 ошибку из прошлой сессии', resource: 'Твои заметки', url: null, duration: 5 },
  { title: 'Посмотри короткое SAT-видео (до 5 мин)', resource: 'SupertutorTV', url: 'https://www.youtube.com/@SupertutorTV', duration: 4 },
  { title: 'Прочитай абзац классической книги', resource: 'Project Gutenberg', url: 'https://www.gutenberg.org', duration: 5 },
  { title: 'Просмотри summary своего плана', resource: 'SATScout', url: null, duration: 2 },
];

const MATH_TOPICS = {
  foundation: ['Linear Equations', 'Ratios & Proportions', 'Percentages & Word Problems', 'Basic Algebra'],
  intermediate: ['Systems of Equations', 'Quadratic Functions', 'Data & Statistics', 'Scatterplots'],
  advanced: ['Advanced Algebra', 'Geometry & Trigonometry', 'Complex Word Problems', 'Functions & Graphs'],
};

const READING_TOPICS = {
  foundation: ['Main Idea & Purpose', 'Basic Grammar Rules', 'Punctuation', 'Subject-Verb Agreement'],
  intermediate: ['Transitions & Rhetoric', 'Inference Questions', 'Vocabulary in Context', 'Sentence Structure'],
  advanced: ['Command of Evidence', 'Craft & Structure', 'Cross-Text Connections', 'Rhetorical Analysis'],
};

function getDayNumber(planStartDate) {
  if (!planStartDate) return 1;
  const [y, m, d] = planStartDate.split('-').map(Number);
  const start = new Date(y, m - 1, d); start.setHours(0, 0, 0, 0);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((now - start) / 86400000) + 1);
}

function Dashboard({ user, profile, language, setCurrentPage, onProfileUpdate, onStartPlan }) {
  const [tasks, setTasks]           = useState([]);
  const [weekFullData, setWeekFullData] = useState([]);
  const [allTasksStats, setAllTasksStats] = useState({ total: 0, completed: 0 });
  const [tasksLoading, setTasksLoading] = useState(true);
  const [confetti, setConfetti]     = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const tasksRef = useRef([]);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);

  const greeting  = getGreeting(language);
  const emailName = user?.email?.split('@')[0] ?? '';
  const totalDays = getDaysUntilTest(profile.exam_timeframe, profile.created_at);
  // Real-score model: baseline is the onboarding starting point; the bar only
  // moves when the student logs an actual practice-test score (no fabricated
  // climb from checking off tasks).
  const baselineScore  = getCurrentScoreNum(profile.current_score) ?? profile.current_score_actual ?? 800;
  const currentScore   = profile.current_score_actual ?? baselineScore;
  const hasLoggedScore = profile.current_score_actual != null;
  const targetScore = profile.target_score ?? 1400;
  const week       = getWeekNumber(profile.created_at);
  const streak     = profile.current_streak ?? 0;
  const ru = language === 'ru';

  const scheduledDays = profile.scheduled_days; // e.g. [1,3,5] or null
  const hasSchedule = scheduledDays?.length > 0;

  // Local date string (avoids UTC timezone shift)
  const todayD = new Date();
  const today = `${todayD.getFullYear()}-${String(todayD.getMonth()+1).padStart(2,'0')}-${String(todayD.getDate()).padStart(2,'0')}`;

  const sessionNum = getTodaySessionNumber(profile.plan_start_date, scheduledDays);
  const todayIsSession = hasSchedule ? sessionNum !== null : true;
  const dayNum = sessionNum ?? getDayNumber(profile.plan_start_date); // fallback for score bar

  const lastSessionDate = hasSchedule
    ? getLastSessionDate(profile.plan_start_date, scheduledDays)
    : today;
  const activeSession = profile.last_completed_session_date
    ? profile.last_completed_session_date === lastSessionDate
    : profile.last_active_date === today;

  const isDay1 = profile.plan_start_date === today;
  const displayStreak = (streak === 0 && isDay1) ? 1 : streak;
  const streakLost = !activeSession && profile.plan_created && !isDay1;

  const nextSessionName = getNextSessionDayName(scheduledDays, language);
  const optionalTask = (ru ? OPTIONAL_TASKS_RU : OPTIONAL_TASKS)[new Date().getDay() % OPTIONAL_TASKS.length];

  const rawScorePct = targetScore > baselineScore
    ? ((currentScore - baselineScore) / (targetScore - baselineScore)) * 100
    : 0;
  const scorePct = Math.max(0, Math.min(100, rawScorePct));

  // Week calendar (Mon-Sun with session info)
  const weekCal = hasSchedule && profile.plan_start_date
    ? getWeekCalendar(profile.plan_start_date, scheduledDays)
    : null;

  // ── Fetch today's tasks ───────────────────────────────────────────────────
  useEffect(() => {
    if (!profile.plan_created) { setTasksLoading(false); return; }

    const fetchNum = hasSchedule ? sessionNum : dayNum;

    Promise.all([
      fetchNum
        ? supabase.from('user_tasks').select('*').eq('user_id', user.id).eq('day_number', fetchNum)
        : Promise.resolve({ data: [] }),
      hasSchedule && weekCal
        ? (() => {
            const sessionNums = weekCal.filter(d => d.sessionNum).map(d => d.sessionNum);
            return sessionNums.length
              ? supabase.from('user_tasks').select('*').eq('user_id', user.id).in('day_number', sessionNums)
              : Promise.resolve({ data: [] });
          })()
        : supabase.from('user_tasks').select('*').eq('user_id', user.id)
            .gte('day_number', dayNum).lte('day_number', dayNum + 6),
      supabase.from('user_tasks').select('completed').eq('user_id', user.id),
    ]).then(([todayRes, weekRes, allRes]) => {
      setTasks(todayRes.data ?? []);
      setWeekFullData(weekRes.data ?? []);
      const all = allRes.data ?? [];
      setAllTasksStats({ total: all.length, completed: all.filter(t => t.completed).length });
      setTasksLoading(false);
    }).catch(() => setTasksLoading(false));
  }, [user.id, profile.plan_created, dayNum, sessionNum, hasSchedule]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mark task complete ────────────────────────────────────────────────────
  const markComplete = useCallback(async (taskId) => {
    const now = new Date().toISOString();
    const { error: dbErr } = await supabase.from('user_tasks')
      .update({ completed: true, completed_at: now })
      .eq('id', taskId);
    if (dbErr) return;

    const updatedTasks = tasksRef.current.map(t => t.id === taskId ? { ...t, completed: true } : t);
    setTasks(updatedTasks);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 1800);

    const todayStr = localToday();
    const allDoneNow = updatedTasks.every(t => t.completed);

    if (hasSchedule) {
      // Session mode: increment streak only when all tasks for today's session are done
      if (allDoneNow && profile.last_completed_session_date !== todayStr) {
        const prevSess = getPrevSessionDate(profile.plan_start_date, scheduledDays, todayStr);
        const newStreak = profile.last_completed_session_date === prevSess
          ? streak + 1
          : 1;
        const longest = Math.max(newStreak, profile.longest_streak ?? 0);
        await supabase.from('profiles').update({
          current_streak: newStreak,
          longest_streak: longest,
          last_completed_session_date: todayStr,
          last_active_date: todayStr,
        }).eq('user_id', user.id);
        if (onProfileUpdate) onProfileUpdate({
          ...profile,
          current_streak: newStreak,
          longest_streak: longest,
          last_completed_session_date: todayStr,
          last_active_date: todayStr,
        });
      }
    } else {
      // Legacy day mode
      if (profile.last_active_date !== todayStr) {
        const d = new Date(); d.setDate(d.getDate() - 1);
        const yesterday = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const newStreak = profile.last_active_date === yesterday ? streak + 1 : 1;
        const longest = Math.max(newStreak, profile.longest_streak ?? 0);
        await supabase.from('profiles').update({
          current_streak: newStreak,
          longest_streak: longest,
          last_active_date: todayStr,
        }).eq('user_id', user.id);
        if (onProfileUpdate) onProfileUpdate({ ...profile, current_streak: newStreak, last_active_date: todayStr });
      }
    }
  }, [profile, streak, user.id, onProfileUpdate, hasSchedule, scheduledDays]);

  // ── Unmark task ───────────────────────────────────────────────────────────
  const unmarkComplete = useCallback(async (taskId) => {
    await supabase.from('user_tasks')
      .update({ completed: false, completed_at: null })
      .eq('id', taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: false } : t));
  }, []);

  // ── Log a real practice-test score ────────────────────────────────────────
  const logScore = async () => {
    const raw = window.prompt(ru
      ? 'Балл последнего пробного теста (400–1600):'
      : 'Your latest practice test score (400–1600):');
    if (raw == null) return;
    const n = Math.round(Number(raw));
    if (!Number.isFinite(n) || n < 400 || n > 1600) {
      window.alert(ru ? 'Введи число от 400 до 1600.' : 'Please enter a number between 400 and 1600.');
      return;
    }
    const { error } = await supabase.from('profiles')
      .update({ current_score_actual: n }).eq('user_id', user.id);
    if (error) {
      window.alert(ru ? 'Не удалось сохранить балл.' : 'Could not save your score.');
      return;
    }
    if (onProfileUpdate) onProfileUpdate({ ...profile, current_score_actual: n });
  };

  // ── Rebuild plan ──────────────────────────────────────────────────────────
  const rebuildPlan = async () => {
    if (!window.confirm(ru ? 'Удалить текущий план и начать заново?' : 'Delete current plan and start over?')) return;
    setRebuilding(true);
    try {
      await supabase.from('user_tasks').delete().eq('user_id', user.id);
      await supabase.from('profiles').update({
        plan_created: false,
        plan_summary: null,
        plan_start_date: null,
        daily_tasks: null,
      }).eq('user_id', user.id);
      if (onProfileUpdate) onProfileUpdate({ ...profile, plan_created: false, plan_summary: null, plan_start_date: null });
      setCurrentPage('ai-buddy');
    } finally {
      setRebuilding(false);
    }
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!profile.plan_created) {
    return (
      <div className="dashboard">
        <div className="dashboard-empty">
          <div className="dashboard-empty__card">
            <div className="dashboard-empty__icon">📋</div>
            <h2 className="dashboard-empty__title">
              {ru ? 'Давай составим твой план' : "Let's build your study plan"}
            </h2>
            <p className="dashboard-empty__desc">
              {ru
                ? 'Задам несколько вопросов и составлю план под твоё расписание'
                : "A few quick questions and I'll put together a plan around your schedule"}
            </p>
            <button
              className="dashboard-empty__btn"
              onClick={() => onStartPlan ? onStartPlan() : setCurrentPage('ai-buddy')}
            >
              {ru ? 'Сгенерировать мой план →' : 'Generate my plan →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completedToday = tasks.filter(t => t.completed).length;
  const todayPct = tasks.length > 0 ? Math.round((completedToday / tasks.length) * 100) : 0;
  const allDone = tasks.length > 0 && completedToday === tasks.length;

  const statusText = allDone
    ? (ru ? 'Готово на сегодня. Хорошая работа.' : "Done for today. Nice work.")
    : displayStreak > 2
      ? (ru ? `🔥 ${displayStreak} ${hasSchedule ? 'сессий' : 'дней'} подряд` : `🔥 ${displayStreak} ${hasSchedule ? 'session' : 'day'} streak`)
      : (ru ? 'Ты в процессе.' : "You're in it.");

  // Week strip data
  const weekMap = {};
  weekFullData.forEach(t => {
    if (!weekMap[t.day_number]) weekMap[t.day_number] = { total: 0, done: 0, tasks: [] };
    weekMap[t.day_number].total++;
    if (t.completed) weekMap[t.day_number].done++;
    weekMap[t.day_number].tasks.push(t);
  });

  // selectedDay is a date string ('2026-06-03') or null (= today)
  const activeDate = selectedDay ?? today;
  const activeDayInfo = weekCal?.find(d => d.date === activeDate);
  const activeDayIsSession = hasSchedule
    ? (activeDayInfo?.isSessionDay ?? todayIsSession)
    : true;
  const activeSessionNum = hasSchedule
    ? (activeDayInfo?.sessionNum ?? (activeDate === today ? sessionNum : null))
    : (activeDate === today ? dayNum : null);

  const isViewingToday = activeDate === today;
  const shownTasks = isViewingToday ? tasks : (weekMap[activeSessionNum]?.tasks ?? []);

  const scoreLevel = currentScore < 1000 ? 'foundation' : currentScore < 1200 ? 'intermediate' : 'advanced';
  const weakSpots = [
    ...(profile.weak_sections?.includes('math')
      ? MATH_TOPICS[scoreLevel].slice(0, 2).map(name => ({ name, section: 'Math' }))
      : []),
    ...(profile.weak_sections?.includes('reading')
      ? READING_TOPICS[scoreLevel].slice(0, 2).map(name => ({ name, section: 'R&W' }))
      : []),
  ].slice(0, 4);

  return (
    <div className="dashboard">
      {confetti && <ConfettiBurst />}
      <div className="dashboard__inner">

        {/* ── Header ── */}
        <div className="dash-header">
          <div className="dash-header__left">
            <h1 className="dash-header__greeting">
              {greeting}, <span className="dash-header__name">{emailName}!</span>
            </h1>
            <p className="dash-header__status">{statusText}</p>
            <p className="dash-header__day">
              {ru ? `День ${dayNum} из ${totalDays}` : `Day ${dayNum} of ${totalDays}`}
              {` · ${ru ? 'Неделя' : 'Week'} ${week}`}
            </p>
          </div>
          <div className={`dash-streak-badge ${streakLost ? 'dash-streak-badge--lost' : ''}`}>
            <span className="dash-streak-badge__fire">{streakLost ? '🩶' : '🔥'}</span>
            <span className="dash-streak-badge__num">{displayStreak}</span>
            <span className="dash-streak-badge__label">{hasSchedule ? (ru ? 'сессий' : 'sessions') : (ru ? 'дней' : 'days')}</span>
          </div>
        </div>

        {/* ── Score progress ── */}
        <div className="dash-score-bar">
          <div className="dash-score-bar__estimated">
            <span className="dash-score-bar__est-num">{currentScore}</span>
            <span className="dash-score-bar__est-label">
              {hasLoggedScore
                ? (ru ? 'Последний балл пробника' : 'Latest practice score')
                : (ru ? 'Стартовый балл — залогируй пробник, чтобы видеть прогресс' : 'Starting score — log a practice test to track progress')}
            </span>
          </div>
          <div className="dash-score-bar__track">
            <div className="dash-score-bar__fill" style={{ width: `${scorePct}%` }} />
          </div>
          <div className="dash-score-bar__endpoints">
            <div className="dash-score-bar__endpoint">
              <span className="dash-score-bar__ep-num">{baselineScore}</span>
              <span className="dash-score-bar__ep-label">{ru ? 'Старт' : 'Starting Score'}</span>
            </div>
            <div className="dash-score-bar__endpoint dash-score-bar__endpoint--right">
              <span className="dash-score-bar__ep-num">{targetScore}</span>
              <span className="dash-score-bar__ep-label">{ru ? 'Цель' : 'Goal Score'}</span>
            </div>
          </div>
          <div className="dash-score-bar__actions">
            <button className="dash-log-score-btn" onClick={logScore}>
              {ru ? '＋ Залогировать балл пробника' : '＋ Log practice score'}
            </button>
            <button className="dash-progress-link" onClick={() => setCurrentPage('progress')}>
              {ru ? 'Детальный прогресс →' : 'Detailed progress →'}
            </button>
          </div>
        </div>

        {/* ── Today's Tasks ── */}
        <section className="dash-section">
          <div className="dash-section__header">
            <h2 className="dash-section__title">
              {hasSchedule && !activeDayIsSession
                ? (ru ? 'День отдыха' : 'Rest Day')
                : isViewingToday
                  ? (ru ? 'Задачи на сегодня' : "Today's Tasks")
                  : (ru ? `Сессия ${activeSessionNum}` : `Session ${activeSessionNum}`)}
            </h2>
            {isViewingToday && allDone && todayIsSession && (
              <span className="dash-section__badge">{ru ? 'Выполнено ✓' : 'Complete ✓'}</span>
            )}
          </div>

          {/* REST DAY BLOCK */}
          {hasSchedule && !activeDayIsSession && (
            <div className="dash-rest-day">
              <div className="dash-rest-day__icon">💤</div>
              <p className="dash-rest-day__text">
                {ru
                  ? `День отдыха. Следующая сессия: ${nextSessionName ?? '—'}.`
                  : `Rest day. Next session: ${nextSessionName ?? '—'}.`}
              </p>
              {optionalTask && (
                <div className="dash-rest-day__optional">
                  <p className="dash-rest-day__opt-label">
                    {ru ? 'Опционально (не влияет на стрик):' : "Optional (doesn't affect streak):"}
                  </p>
                  <div className="dash-rest-day__opt-task">
                    <span className="dash-rest-day__opt-title">{optionalTask.title}</span>
                    <span className="dash-rest-day__opt-meta">{optionalTask.duration} min · {optionalTask.resource}</span>
                    {optionalTask.url && (
                      <a href={optionalTask.url} target="_blank" rel="noopener noreferrer" className="task-card__link">
                        {ru ? 'Открыть →' : 'Open →'}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TASK CARDS */}
          {(!hasSchedule || activeDayIsSession) && (
            tasksLoading ? (
              <div className="dash-tasks-loading">
                <div className="chat-typing"><span/><span/><span/></div>
              </div>
            ) : shownTasks.length === 0 && isViewingToday && allTasksStats.total === 0 ? (
              <div className="dash-no-tasks">
                <p>{ru ? 'Задачи не найдены. Создай план в AI чате.' : 'No tasks found. Build your plan in the AI chat.'}</p>
                <button
                  className="dashboard-empty__btn"
                  style={{ marginTop: 12 }}
                  onClick={() => setCurrentPage('ai-buddy')}
                >
                  {ru ? 'Создать план →' : 'Create Plan →'}
                </button>
              </div>
            ) : shownTasks.length === 0 ? (
              <div className="dash-no-tasks">
                {isViewingToday
                  ? (ru ? 'Нет задач на сегодня — отдохни! 🎉' : 'No tasks for today — take a rest! 🎉')
                  : (ru ? 'Нет задач на эту сессию' : 'No tasks for this session')}
              </div>
            ) : (
              <div className="task-cards">
                {shownTasks.map(task => {
                  const meta = TYPE_META[task.task_type] || TYPE_META.practice;
                  return (
                    <div key={task.id} className={`task-card task-card--${meta.color} ${task.completed ? 'task-card--done' : ''}`}>
                      <div className="task-card__top">
                        <span className="task-card__type-badge">{meta.icon} {meta.label}</span>
                        <span className="task-card__duration">{task.duration_minutes} min</span>
                      </div>
                      <p className="task-card__title">{task.task_title}</p>
                      <p className="task-card__resource">{task.resource_name}</p>
                      <div className="task-card__actions">
                        {task.resource_url && (
                          <a href={task.resource_url} target="_blank" rel="noopener noreferrer" className="task-card__link">
                            {ru ? 'Открыть →' : 'Open →'}
                          </a>
                        )}
                        {isViewingToday && (
                          <button
                            className={`task-card__check ${task.completed ? 'task-card__check--done' : ''}`}
                            onClick={() => task.completed ? unmarkComplete(task.id) : markComplete(task.id)}
                          >
                            {task.completed ? (ru ? '✓ Готово' : '✓ Done') : (ru ? 'Отметить' : 'Mark done')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {isViewingToday && todayIsSession && tasks.length > 0 && (
            <div className="dash-today-progress">
              <div className="dash-today-progress__track">
                <div className="dash-today-progress__fill" style={{ width: `${todayPct}%` }} />
              </div>
              <span className="dash-today-progress__label">
                {completedToday}/{tasks.length} {ru ? 'задач выполнено' : 'tasks done'}
              </span>
            </div>
          )}
        </section>

        {/* ── This Week ── */}
        <section className="dash-section">
          <h2 className="dash-section__title">{ru ? 'Эта неделя' : 'This Week'}</h2>

          <div className="week-strip">
            {hasSchedule && weekCal ? (
              weekCal.map(day => {
                const info = weekMap[day.sessionNum];
                const isDone = info && info.done === info.total && info.total > 0;
                const isPartial = info && info.done > 0 && info.done < info.total;
                const isSelected = day.date === activeDate;
                return (
                  <button
                    key={day.date}
                    className={`week-day ${day.isToday ? 'week-day--today' : ''} ${!day.isSessionDay ? 'week-day--rest' : ''} ${isDone ? 'week-day--done' : ''} ${isSelected ? 'week-day--selected' : ''}`}
                    onClick={() => {
                      setSelectedDay(day.date === today ? null : (day.date === selectedDay ? null : day.date));
                    }}
                  >
                    <span className="week-day__num">{(ru ? DAY_SHORT_RU : DAY_SHORT_EN)[day.weekday]}</span>
                    <span className="week-day__status">
                      {!day.isSessionDay ? '·' : isDone ? '✓' : isPartial ? '◑' : day.isToday ? '●' : day.isFuture ? '·' : '○'}
                    </span>
                  </button>
                );
              })
            ) : (
              // Legacy: show session numbers
              Array.from({ length: 7 }, (_, i) => dayNum + i).map(d => {
                const isToday = d === dayNum;
                const isSelected = d === (activeSessionNum ?? dayNum);
                const info = weekMap[d];
                const isDone = info && info.done === info.total && info.total > 0;
                const isPartial = info && info.done > 0 && info.done < info.total;
                return (
                  <button
                    key={d}
                    className={`week-day ${isToday ? 'week-day--today' : ''} ${isDone ? 'week-day--done' : ''} ${isSelected ? 'week-day--selected' : ''}`}
                    onClick={() => setSelectedDay(isToday ? null : (d === (activeSessionNum ?? dayNum) ? null : d))}
                  >
                    <span className="week-day__num">{ru ? `Д${d}` : `D${d}`}</span>
                    <span className="week-day__status">{isDone ? '✓' : isPartial ? '◑' : isToday ? '●' : '·'}</span>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* ── Bottom grid ── */}
        <div className="dash-bottom-grid">

          {/* Weak Spots */}
          {weakSpots.length > 0 && (
            <section className="dash-weak-spots">
              <h2 className="dash-section__title">{ru ? 'Слабые стороны' : 'Your Weak Spots'}</h2>
              <div className="weak-list">
                {weakSpots.map((spot, i) => (
                  <div key={i} className="weak-item">
                    <div className="weak-item__header">
                      <div>
                        <span className="weak-item__section">{spot.section}</span>
                        <span className="weak-item__name">{spot.name}</span>
                      </div>
                      <button
                        className="weak-item__btn"
                        onClick={() => setCurrentPage('ai-buddy')}
                      >
                        {ru ? 'Практика' : 'Practice'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AI Buddy CTA */}
          <button className="dash-ai-btn" onClick={() => setCurrentPage('ai-buddy')}>
            <span className="dash-ai-btn__star">✦</span>
            <div className="dash-ai-btn__text">
              <span className="dash-ai-btn__title">{ru ? 'Спросить AI Помощника' : 'Ask AI Buddy'}</span>
              <span className="dash-ai-btn__sub">{ru ? 'Объяснит, разберёт, скорректирует план' : 'Explain, solve problems, adjust your plan'}</span>
            </div>
            <span className="dash-ai-btn__arrow">→</span>
          </button>
        </div>

        {/* ── Rebuild plan ── */}
        <div className="dash-rebuild-wrap">
          <button className="dash-rebuild-btn" onClick={rebuildPlan} disabled={rebuilding}>
            {rebuilding
              ? (ru ? 'Удаляю...' : 'Clearing...')
              : (ru ? 'Пересоздать план' : 'Rebuild my plan')}
          </button>
        </div>

      </div>
    </div>
  );
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 18 }, (_, i) => i);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
  return (
    <div className="confetti-wrap" aria-hidden="true">
      {pieces.map(i => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.4}s`,
            width: `${6 + Math.random() * 6}px`,
            height: `${6 + Math.random() * 6}px`,
          }}
        />
      ))}
    </div>
  );
}

export default Dashboard;
