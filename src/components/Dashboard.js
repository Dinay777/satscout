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
  },
};

const colorMap = {
  blue:   { bg: 'rgba(59,130,246,0.08)',  bar: '#3b82f6' },
  green:  { bg: 'rgba(16,185,129,0.08)',  bar: '#10b981' },
  teal:   { bg: 'rgba(6,182,212,0.08)',   bar: '#06b6d4' },
  purple: { bg: 'rgba(139,92,246,0.08)', bar: '#8b5cf6' },
};

function Dashboard({ user, profile, language, setCurrentPage }) {
  const t = text[language] || text.en;
  const tasks = getTodaysTasks(profile, language);
  const [done, setDone] = useState({});

  const days       = getDaysUntilTest(profile.exam_timeframe);
  const currentNum = getCurrentScoreNum(profile.current_score);
  const pct        = getProgressPercent(currentNum, profile.target_score);
  const greeting   = getGreeting(language);
  const week       = getWeekNumber(profile.created_at);
  const doneCount  = Object.values(done).filter(Boolean).length;

  const emailName  = user?.email?.split('@')[0] ?? '';

  const toggleTask = (id) => setDone(prev => ({ ...prev, [id]: !prev[id] }));

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
              {t.weekLabel} {week} · {doneCount}/{tasks.length} {t.completed}
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

            {/* Today's tasks */}
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

            {/* Weekly focus */}
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
