import React, { useState } from 'react';
import {
  getDaysUntilTest,
  getCurrentScoreNum,
  getProgressPercent,
  getGreeting,
  getWeekNumber,
  getTodaysTasks,
} from '../lib/studyPlan';

const text = {
  en: {
    daysLeft: 'days to test',
    scoreGoal: 'Score Goal',
    current: 'Current',
    target: 'Target',
    notTaken: 'TBD',
    todayLabel: "Today's Tasks",
    weekLabel: 'Week',
    completed: 'completed',
    allDone: "You're done for today! 🎉",
    aiBtnLabel: 'Ask AI Buddy',
    aiBtnSub: 'Explain today\'s material, solve problems, adjust your plan',
    resourcesLabel: 'Resource Library',
    weeklyTitle: 'This week\'s focus',
    weeklyItems: (sections) => {
      const items = [];
      if (!sections || sections.includes('math'))    items.push('Khan Academy Math units');
      if (!sections || sections.includes('reading')) items.push('Erica Meltzer chapters');
      items.push('1 timed practice section');
      items.push('Review all mistakes');
      return items;
    },
    streakLabel: 'day streak',
    noPlanTitle: 'No study plan yet',
    noPlanDesc: 'Chat with AI Buddy to build your personalized week-by-week plan based on your goals and timeline.',
    noPlanBtn: 'Create my study plan →',
    planSummaryLabel: 'Your plan',
  },
  ru: {
    daysLeft: 'дней до теста',
    scoreGoal: 'Цель по баллу',
    current: 'Сейчас',
    target: 'Цель',
    notTaken: 'Нет данных',
    todayLabel: 'Задачи на сегодня',
    weekLabel: 'Неделя',
    completed: 'выполнено',
    allDone: 'На сегодня всё! 🎉',
    aiBtnLabel: 'Спросить AI Помощника',
    aiBtnSub: 'Объяснит материал, решит задачу, скорректирует план',
    resourcesLabel: 'Библиотека ресурсов',
    weeklyTitle: 'Фокус этой недели',
    weeklyItems: (sections) => {
      const items = [];
      if (!sections || sections.includes('math'))    items.push('Разделы Khan Academy по математике');
      if (!sections || sections.includes('reading')) items.push('Главы Erica Meltzer');
      items.push('1 раздел теста на время');
      items.push('Разбор всех ошибок');
      return items;
    },
    streakLabel: 'день подряд',
    noPlanTitle: 'Плана подготовки пока нет',
    noPlanDesc: 'Поговори с AI Помощником — он составит персональный план по неделям с учётом твоей цели и сроков.',
    noPlanBtn: 'Создать мой план →',
    planSummaryLabel: 'Твой план',
  },
};

const colorMap = {
  blue:   { bg: 'rgba(59,130,246,0.08)',  bar: '#3b82f6' },
  green:  { bg: 'rgba(16,185,129,0.08)',  bar: '#10b981' },
  teal:   { bg: 'rgba(6,182,212,0.08)',   bar: '#06b6d4' },
  purple: { bg: 'rgba(139,92,246,0.08)', bar: '#8b5cf6' },
};

const todayKey = () => new Date().toISOString().slice(0, 10); // "2026-05-25"

function Dashboard({ user, profile, language, setCurrentPage }) {
  const t = text[language] || text.en;
  const tasks = (profile.plan_created && Array.isArray(profile.daily_tasks) && profile.daily_tasks.length > 0)
    ? profile.daily_tasks
    : getTodaysTasks(profile, language);

  const storageKey = `tasks_done_${user?.id}`;

  const [done, setDone] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved?.date === todayKey()) return saved.done;
    } catch (_) {}
    return {};
  });

  const days       = getDaysUntilTest(profile.exam_timeframe);
  const currentNum = profile.current_score_actual ?? getCurrentScoreNum(profile.current_score);
  const pct        = getProgressPercent(currentNum, profile.target_score);
  const greeting   = getGreeting(language);
  const week       = getWeekNumber(profile.created_at);
  const doneCount  = Object.values(done).filter(Boolean).length;

  const emailName  = user?.email?.split('@')[0] ?? '';

  const toggleTask = (id) => setDone(prev => {
    const next = { ...prev, [id]: !prev[id] };
    try { localStorage.setItem(storageKey, JSON.stringify({ date: todayKey(), done: next })); } catch (_) {}
    return next;
  });

  return (
    <div className="dashboard">
      <div className="dashboard__inner">

        {/* ── Header ── */}
        <div className="dashboard__header">
          <div>
            <h1 className="dashboard__greeting">
              {greeting}, <span className="dashboard__name">{emailName}</span>
            </h1>
            <p className="dashboard__subtitle">
              {t.weekLabel} {week}{profile.plan_created ? ` · ${doneCount}/${tasks.length} ${t.completed}` : ''}
            </p>
          </div>
          <div className="dashboard__days-badge">
            <span className="dashboard__days-num">{days}</span>
            <span className="dashboard__days-label">{t.daysLeft}</span>
          </div>
        </div>

        <div className="dashboard__grid">

          {/* ── Left column ── */}
          <div className="dashboard__left">

            {/* Score card */}
            <div className="dash-card dash-card--score">
              <span className="dash-card__label">{t.scoreGoal}</span>
              <div className="score-widget">
                <div className="score-widget__nums">
                  <div className="score-widget__item">
                    <span className="score-widget__sub">{t.current}</span>
                    <span className="score-widget__num score-widget__num--current">
                      {currentNum ?? t.notTaken}
                    </span>
                  </div>
                  <div className="score-widget__arrow">→</div>
                  <div className="score-widget__item">
                    <span className="score-widget__sub">{t.target}</span>
                    <span className="score-widget__num score-widget__num--target">
                      {profile.target_score}
                    </span>
                  </div>
                </div>
                <div className="score-widget__bar-wrap">
                  <div className="score-widget__bar">
                    <div
                      className="score-widget__bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {currentNum && (
                    <span className="score-widget__gap">
                      +{profile.target_score - currentNum} pts to go
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Today's tasks or no-plan CTA */}
            {!profile.plan_created ? (
              <div className="dash-card dash-no-plan">
                <span className="dash-card__label">{t.todayLabel}</span>
                <div className="dash-no-plan__body">
                  <div className="dash-no-plan__icon">🗓️</div>
                  <h3 className="dash-no-plan__title">{t.noPlanTitle}</h3>
                  <p className="dash-no-plan__desc">{t.noPlanDesc}</p>
                  <button
                    className="dash-no-plan__btn"
                    onClick={() => setCurrentPage('ai-buddy')}
                  >
                    {t.noPlanBtn}
                  </button>
                </div>
              </div>
            ) : (
              <div className="dash-card">
                <span className="dash-card__label">{t.todayLabel}</span>

                {doneCount === tasks.length ? (
                  <div className="dash-all-done">{t.allDone}</div>
                ) : (
                  <div className="task-list">
                    {tasks.map(task => {
                      const isDone = !!done[task.id];
                      const c = colorMap[task.color] || colorMap.blue;
                      return (
                        <div
                          key={task.id}
                          className={`task-item ${isDone ? 'task-item--done' : ''}`}
                          style={{ '--task-bar': c.bar, '--task-bg': c.bg }}
                          onClick={() => toggleTask(task.id)}
                        >
                          <div className="task-item__bar" />
                          <div className="task-item__check">
                            {isDone ? '✓' : ''}
                          </div>
                          <div className="task-item__body">
                            <span className="task-item__title">{task.title}</span>
                            <span className="task-item__action">{task.action}</span>
                          </div>
                          <span className="task-item__duration">{task.duration}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* AI Buddy CTA */}
            <button
              className="dash-ai-btn"
              onClick={() => setCurrentPage('ai-buddy')}
            >
              <span className="dash-ai-btn__star">✦</span>
              <div className="dash-ai-btn__text">
                <span className="dash-ai-btn__title">{t.aiBtnLabel}</span>
                <span className="dash-ai-btn__sub">{t.aiBtnSub}</span>
              </div>
              <span className="dash-ai-btn__arrow">→</span>
            </button>
          </div>

          {/* ── Right column ── */}
          <div className="dashboard__right">

            {/* Plan summary (if exists) or weekly focus */}
            {profile.plan_summary ? (
              <div className="dash-card">
                <span className="dash-card__label">{t.planSummaryLabel}</span>
                <p className="dash-plan-summary">{profile.plan_summary}</p>
                <button
                  className="dash-resources-btn"
                  style={{ marginTop: '12px' }}
                  onClick={() => setCurrentPage('ai-buddy')}
                >
                  {language === 'ru' ? 'Скорректировать план →' : 'Adjust plan →'}
                </button>
              </div>
            ) : (
              <div className="dash-card">
                <span className="dash-card__label">{t.weeklyTitle}</span>
                <ul className="weekly-list">
                  {t.weeklyItems(profile.weak_sections).map((item, i) => (
                    <li key={i} className="weekly-list__item">
                      <span className="weekly-list__dot" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick links */}
            <div className="dash-card">
              <span className="dash-card__label">{t.resourcesLabel}</span>
              <button
                className="dash-resources-btn"
                onClick={() => setCurrentPage('resources')}
              >
                {language === 'ru' ? 'Открыть библиотеку →' : 'Browse library →'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
