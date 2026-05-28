import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { generateAndSavePlan } from '../lib/planGenerator';
import {
  getDaysUntilTest,
  getCurrentScoreNum,
  getGreeting,
  getWeekNumber,
} from '../lib/studyPlan';

const TYPE_META = {
  video:    { icon: '🎬', label: 'Video',    color: 'blue'   },
  read:     { icon: '📖', label: 'Read',     color: 'orange' },
  practice: { icon: '✏️', label: 'Practice', color: 'green'  },
};

const WEAK_SPOT_MAP = {
  math: [
    { name: 'Algebra & Functions' },
    { name: 'Data Analysis' },
    { name: 'Advanced Math' },
  ],
  reading: [
    { name: 'Standard English Conventions' },
    { name: 'Reading Comprehension' },
    { name: 'Vocabulary in Context' },
  ],
};

function getDayNumber(planStartDate) {
  if (!planStartDate) return 1;
  const diff = Date.now() - new Date(planStartDate).getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}

function Dashboard({ user, profile, language, setCurrentPage, onProfileUpdate }) {
  const [tasks, setTasks]           = useState([]);
  const [weekFullData, setWeekFullData] = useState([]);
  const [allTasksStats, setAllTasksStats] = useState({ total: 0, completed: 0 });
  const [tasksLoading, setTasksLoading] = useState(true);
  const [confetti, setConfetti]     = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [generatingTasks, setGeneratingTasks] = useState(false);

  const greeting  = getGreeting(language);
  const emailName = user?.email?.split('@')[0] ?? '';
  const dayNum    = getDayNumber(profile.plan_start_date);
  const totalDays = getDaysUntilTest(profile.exam_timeframe, profile.created_at);
  const startScore  = profile.current_score_actual ?? getCurrentScoreNum(profile.current_score) ?? 800;
  const targetScore = profile.target_score ?? 1400;
  const week       = getWeekNumber(profile.created_at);
  const streak     = profile.current_streak ?? 0;

  const activeDay = selectedDay ?? dayNum;
  // Show 1 on day 1 before any task is completed; gray if streak was lost
  const displayStreak = streak === 0 && !profile.last_active_date && profile.plan_created ? 1 : streak;
  const streakLost    = streak === 0 && !!profile.last_active_date;

  const completionRate = allTasksStats.total > 0 ? allTasksStats.completed / allTasksStats.total : 0;
  const estimatedScore = Math.round(startScore + (targetScore - startScore) * completionRate);
  const rawScorePct = targetScore > startScore
    ? ((estimatedScore - startScore) / (targetScore - startScore)) * 100
    : 0;
  const scorePct = profile.plan_created ? Math.max(2.5, rawScorePct) : 0;

  const ru = language === 'ru';

  // ── Fetch today's tasks ───────────────────────────────────────────────────
  useEffect(() => {
    if (!profile.plan_created) { setTasksLoading(false); return; }

    Promise.all([
      supabase.from('user_tasks').select('*').eq('user_id', user.id).eq('day_number', dayNum),
      supabase.from('user_tasks').select('*').eq('user_id', user.id)
        .gte('day_number', dayNum).lte('day_number', dayNum + 6),
      supabase.from('user_tasks').select('completed').eq('user_id', user.id),
    ]).then(([todayRes, weekRes, allRes]) => {
      setTasks(todayRes.data ?? []);
      setWeekFullData(weekRes.data ?? []);
      const all = allRes.data ?? [];
      setAllTasksStats({ total: all.length, completed: all.filter(t => t.completed).length });
      setTasksLoading(false);
    });
  }, [user.id, profile.plan_created, dayNum]);

  // ── Mark task complete ────────────────────────────────────────────────────
  const markComplete = useCallback(async (taskId) => {
    const now = new Date().toISOString();
    await supabase.from('user_tasks')
      .update({ completed: true, completed_at: now })
      .eq('id', taskId);

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
    setConfetti(true);
    setTimeout(() => setConfetti(false), 1800);

    // Update streak
    const today = new Date().toISOString().slice(0, 10);
    if (profile.last_active_date !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newStreak = profile.last_active_date === yesterday ? streak + 1 : 1;
      const longest = Math.max(newStreak, profile.longest_streak ?? 0);
      await supabase.from('profiles').update({
        current_streak: newStreak,
        longest_streak: longest,
        last_active_date: today,
      }).eq('user_id', user.id);
      if (onProfileUpdate) onProfileUpdate({ ...profile, current_streak: newStreak, last_active_date: today });
    }
  }, [profile, streak, user.id, onProfileUpdate]);

  // ── Unmark task ───────────────────────────────────────────────────────────
  const unmarkComplete = useCallback(async (taskId) => {
    await supabase.from('user_tasks')
      .update({ completed: false, completed_at: null })
      .eq('id', taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: false } : t));
  }, []);

  // ── Rebuild plan ──────────────────────────────────────────────────────────
  const rebuildPlan = async () => {
    if (!window.confirm(ru ? 'Удалить текущий план и начать заново?' : 'Delete current plan and start over?')) return;
    setRebuilding(true);
    await supabase.from('user_tasks').delete().eq('user_id', user.id);
    await supabase.from('profiles').update({
      plan_created: false,
      plan_summary: null,
      plan_start_date: null,
      daily_tasks: null,
    }).eq('user_id', user.id);
    if (onProfileUpdate) onProfileUpdate({ ...profile, plan_created: false, plan_summary: null, plan_start_date: null });
    setRebuilding(false);
    setCurrentPage('ai-buddy');
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
                ? 'Задам тебе пару вопросов чтобы создать план который реально впишется в твою жизнь'
                : "I'll ask you a few questions to create a plan that actually fits your life"}
            </p>
            <button
              className="dashboard-empty__btn"
              onClick={() => setCurrentPage('ai-buddy')}
            >
              {ru ? 'Начать планирование →' : 'Start Planning →'}
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
    ? (ru ? '🎉 На сегодня всё выполнено!' : "🎉 All done for today!")
    : displayStreak > 2
      ? (ru ? `🔥 ${displayStreak} дней подряд — продолжай!` : `🔥 ${displayStreak} day streak — keep it up!`)
      : (ru ? 'Ты в пути 💪' : "You're on track 💪");

  // Week strip: today + next 6 days
  const weekDays = Array.from({ length: 7 }, (_, i) => dayNum + i);
  const weekMap = {};
  weekFullData.forEach(t => {
    if (!weekMap[t.day_number]) weekMap[t.day_number] = { total: 0, done: 0, tasks: [] };
    weekMap[t.day_number].total++;
    if (t.completed) weekMap[t.day_number].done++;
    weekMap[t.day_number].tasks.push(t);
  });

  // Tasks shown in the main section (today = interactive, future = read-only)
  const isViewingToday = activeDay === dayNum;
  const shownTasks = isViewingToday ? tasks : (weekMap[activeDay]?.tasks ?? []);

  const weakSpots = [
    ...(profile.weak_sections?.includes('math') ? WEAK_SPOT_MAP.math : []),
    ...(profile.weak_sections?.includes('reading') ? WEAK_SPOT_MAP.reading : []),
  ].slice(0, 3);

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
            <span className="dash-streak-badge__label">{ru ? 'дней' : 'days'}</span>
          </div>
        </div>

        {/* ── Score progress ── */}
        <div className="dash-score-bar">
          <div className="dash-score-bar__estimated">
            <span className="dash-score-bar__est-num">{estimatedScore}</span>
            <span className="dash-score-bar__est-label">
              {completionRate === 0 && profile.plan_created
                ? (ru ? 'План создан — ты уже начала! 🎉' : 'Plan created — you\'ve already started! 🎉')
                : (ru ? 'Текущий прогноз' : 'Estimated Score')}
            </span>
          </div>
          <div className="dash-score-bar__track">
            <div className="dash-score-bar__fill" style={{ width: `${scorePct}%` }} />
          </div>
          <div className="dash-score-bar__endpoints">
            <div className="dash-score-bar__endpoint">
              <span className="dash-score-bar__ep-num">{startScore}</span>
              <span className="dash-score-bar__ep-label">{ru ? 'Старт' : 'Starting Score'}</span>
            </div>
            <div className="dash-score-bar__endpoint dash-score-bar__endpoint--right">
              <span className="dash-score-bar__ep-num">{targetScore}</span>
              <span className="dash-score-bar__ep-label">{ru ? 'Цель' : 'Goal Score'}</span>
            </div>
          </div>
        </div>

        {/* ── Today's Tasks ── */}
        <section className="dash-section">
          <div className="dash-section__header">
            <h2 className="dash-section__title">
              {isViewingToday
                ? (ru ? 'Задачи на сегодня' : "Today's Tasks")
                : (ru ? `День ${activeDay}` : `Day ${activeDay}`)}
            </h2>
            {isViewingToday && allDone && <span className="dash-section__badge">{ru ? 'Выполнено ✓' : 'Complete ✓'}</span>}
            {!isViewingToday && <span className="dash-section__badge dash-section__badge--future">{ru ? 'Впереди' : 'Upcoming'}</span>}
          </div>

          {tasksLoading ? (
            <div className="dash-tasks-loading">
              <div className="chat-typing"><span/><span/><span/></div>
            </div>
          ) : shownTasks.length === 0 && isViewingToday && allTasksStats.total === 0 ? (
            <div className="dash-no-tasks">
              <p>{ru ? 'Задачи не найдены — нужно сгенерировать план.' : 'Tasks not found — need to generate your plan.'}</p>
              <button
                className="dashboard-empty__btn"
                style={{ marginTop: 12 }}
                disabled={generatingTasks}
                onClick={async () => {
                  setGeneratingTasks(true);
                  await generateAndSavePlan(profile, user.id);
                  const today = new Date().toISOString().slice(0, 10);
                  if (onProfileUpdate) onProfileUpdate({ ...profile, plan_created: true, plan_start_date: today });
                  window.location.reload();
                }}
              >
                {generatingTasks
                  ? (ru ? 'Генерирую...' : 'Generating...')
                  : (ru ? '⚡ Сгенерировать задачи' : '⚡ Generate Tasks')}
              </button>
            </div>
          ) : shownTasks.length === 0 ? (
            <div className="dash-no-tasks">
              {isViewingToday
                ? (ru ? 'Нет задач на сегодня — отдохни! 🎉' : 'No tasks for today — take a rest! 🎉')
                : (ru ? 'Нет задач на этот день' : 'No tasks for this day')}
            </div>
          ) : (
            <div className="task-cards">
              {shownTasks.map(task => {
                const meta = TYPE_META[task.task_type] || TYPE_META.practice;
                return (
                  <div
                    key={task.id}
                    className={`task-card task-card--${meta.color} ${task.completed ? 'task-card--done' : ''}`}
                  >
                    <div className="task-card__top">
                      <span className="task-card__type-badge">
                        {meta.icon} {meta.label}
                      </span>
                      <span className="task-card__duration">{task.duration_minutes} min</span>
                    </div>
                    <p className="task-card__title">{task.task_title}</p>
                    <p className="task-card__resource">{task.resource_name}</p>
                    <div className="task-card__actions">
                      {task.resource_url && (
                        <a
                          href={task.resource_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="task-card__link"
                        >
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
          )}

          {/* Today's progress bar */}
          {isViewingToday && tasks.length > 0 && (
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
            {weekDays.map(d => {
              const isToday    = d === dayNum;
              const isSelected = d === activeDay;
              const info       = weekMap[d];
              const isDone     = info && info.done === info.total && info.total > 0;
              const isPartial  = info && info.done > 0 && info.done < info.total;

              return (
                <button
                  key={d}
                  className={`week-day ${isToday ? 'week-day--today' : ''} ${isDone ? 'week-day--done' : ''} ${isSelected ? 'week-day--selected' : ''}`}
                  onClick={() => setSelectedDay(d === activeDay && !isToday ? null : d)}
                >
                  <span className="week-day__num">{ru ? `Д${d}` : `D${d}`}</span>
                  <span className="week-day__status">
                    {isDone ? '✓' : isPartial ? '◑' : isToday ? '●' : '·'}
                  </span>
                </button>
              );
            })}
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
                      <span className="weak-item__name">{spot.name}</span>
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
