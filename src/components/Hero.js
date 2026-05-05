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
  }
};

function Hero({ language, setCurrentPage }) {
  const t = text[language];

  return (
    <section className="hero">
      <div className="hero__bg-grid"></div>
      
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
    </section>
  );
}

export default Hero;
