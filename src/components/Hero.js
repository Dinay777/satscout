import React from 'react';

const text = {
  en: {
    badge: 'Free SAT Prep Platform',
    title1: 'Your smartest path',
    title2: 'to a top SAT score',
    subtitle: 'Curated resources, AI-powered study help, and personalized prep plans — all in one place. Built by a student, for students.',
    cta1: 'Explore Resources',
    cta2: 'Ask AI Buddy',
    stat1num: '50+',
    stat1label: 'Curated resources',
    stat2num: '24/7',
    stat2label: 'AI study help',
    stat3num: '2',
    stat3label: 'Languages',
    mockupTitle: 'Your Study Plan',
    mockupDays: '31 days to test',
    mockupCurrent: 'Current',
    mockupTarget: 'Target',
    mockupProgressLabel: '42% to goal',
    mockupTodayLabel: "Today's Tasks",
    mockupTasks: [
      { done: true,  text: 'Khan Academy: Linear Equations' },
      { done: false, text: 'Practice Test #3 · Math Module' },
      { done: false, text: 'Erica Meltzer: Ch. 5' },
    ],
    mockupAIHint: 'Explain quadratic formula...',
    floatScore: '+350 pts',
    floatScoreLabel: 'avg. improvement',
    floatRating: '⭐ 4.9',
    floatRatingLabel: 'Khan Academy',
  },
  ru: {
    badge: 'Бесплатная подготовка к SAT',
    title1: 'Твой лучший путь',
    title2: 'к высокому баллу SAT',
    subtitle: 'Проверенные ресурсы, AI-помощник и персональные планы подготовки — всё в одном месте. Создано студентом для студентов.',
    cta1: 'Ресурсы',
    cta2: 'AI Помощник',
    stat1num: '50+',
    stat1label: 'Проверенных ресурсов',
    stat2num: '24/7',
    stat2label: 'AI помощник',
    stat3num: '2',
    stat3label: 'Языка',
    mockupTitle: 'Твой план',
    mockupDays: '31 день до теста',
    mockupCurrent: 'Сейчас',
    mockupTarget: 'Цель',
    mockupProgressLabel: '42% к цели',
    mockupTodayLabel: 'Задачи на сегодня',
    mockupTasks: [
      { done: true,  text: 'Khan Academy: Линейные уравнения' },
      { done: false, text: 'Тест #3 · Математика' },
      { done: false, text: 'Erica Meltzer: Гл. 5' },
    ],
    mockupAIHint: 'Объясни квадратную формулу...',
    floatScore: '+350 балл.',
    floatScoreLabel: 'средний прирост',
    floatRating: '⭐ 4.9',
    floatRatingLabel: 'Khan Academy',
  }
};

function Hero({ language, setCurrentPage }) {
  const t = text[language];

  return (
    <section className="hero">
      <div className="hero__bg-grid"></div>

      <div className="hero__inner">
        {/* Left: text content */}
        <div className="hero__content">
          <div className="hero__badge">{t.badge}</div>

          <h1 className="hero__title">
            {t.title1}
            <br />
            <span className="hero__title-accent">{t.title2}</span>
          </h1>

          <p className="hero__subtitle">{t.subtitle}</p>

          <div className="hero__buttons">
            <button
              className="btn btn--primary"
              onClick={() => setCurrentPage('resources')}
            >
              {t.cta1}
              <span className="btn__arrow">→</span>
            </button>
            <button
              className="btn btn--secondary"
              onClick={() => setCurrentPage('ai-buddy')}
            >
              {t.cta2}
            </button>
          </div>

          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-number">{t.stat1num}</span>
              <span className="hero__stat-label">{t.stat1label}</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-number">{t.stat2num}</span>
              <span className="hero__stat-label">{t.stat2label}</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-number">{t.stat3num}</span>
              <span className="hero__stat-label">{t.stat3label}</span>
            </div>
          </div>
        </div>

        {/* Right: app mockup */}
        <div className="hero__visual">
          <div className="plan-mockup">
            <div className="plan-mockup__header">
              <span className="plan-mockup__title">{t.mockupTitle}</span>
              <span className="plan-mockup__days">{t.mockupDays}</span>
            </div>

            <div className="plan-mockup__scores">
              <div className="plan-mockup__score-item">
                <span className="plan-mockup__score-label">{t.mockupCurrent}</span>
                <span className="plan-mockup__score-num">1050</span>
              </div>
              <div className="plan-mockup__score-arrow">→</div>
              <div className="plan-mockup__score-item">
                <span className="plan-mockup__score-label">{t.mockupTarget}</span>
                <span className="plan-mockup__score-num plan-mockup__score-num--target">1400</span>
              </div>
            </div>

            <div className="plan-mockup__progress-wrap">
              <div className="plan-mockup__progress-bar">
                <div className="plan-mockup__progress-fill"></div>
              </div>
              <span className="plan-mockup__progress-label">{t.mockupProgressLabel}</span>
            </div>

            <div className="plan-mockup__tasks-section">
              <h4 className="plan-mockup__tasks-title">{t.mockupTodayLabel}</h4>
              {t.mockupTasks.map((task, i) => (
                <div className={`plan-mockup__task ${task.done ? 'plan-mockup__task--done' : ''}`} key={i}>
                  <div className="plan-mockup__check">{task.done ? '✓' : ''}</div>
                  <span className="plan-mockup__task-text">{task.text}</span>
                </div>
              ))}
            </div>

            <div className="plan-mockup__ai-bar" onClick={() => setCurrentPage('ai-buddy')}>
              <span className="plan-mockup__ai-star">✦</span>
              <span className="plan-mockup__ai-hint">{t.mockupAIHint}</span>
              <span className="plan-mockup__ai-send">→</span>
            </div>
          </div>

          <div className="hero__float hero__float--score">
            <span className="hero__float-num">{t.floatScore}</span>
            <span className="hero__float-label">{t.floatScoreLabel}</span>
          </div>

          <div className="hero__float hero__float--resource">
            <span className="hero__float-rating">{t.floatRating}</span>
            <span className="hero__float-name">{t.floatRatingLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
