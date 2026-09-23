import React from 'react';

const text = {
  en: {
    title: 'Stop juggling ten tabs. Start a real plan.',
    subtitle: "It's free — no card, no $200 course, no catch.",
    cta1: 'Explore Resources',
    cta2: 'Talk to AI Buddy',
  },
  ru: {
    title: 'Хватит жонглировать десятью вкладками. Начни нормальный план.',
    subtitle: 'Это бесплатно — без карты, без курса за 200$, без подвоха.',
    cta1: 'Смотреть ресурсы',
    cta2: 'Спросить AI',
  }
};

function CTA({ language, setCurrentPage }) {
  const t = text[language];

  return (
    <section className="cta-section">
      <div className="cta-section__inner">
        <div className="cta-section__glow"></div>
        <h2 className="cta-section__title">{t.title}</h2>
        <p className="cta-section__subtitle">{t.subtitle}</p>
        <div className="cta-section__buttons">
          <button className="btn btn--white" onClick={() => setCurrentPage('resources')}>
            {t.cta1}
            <span className="btn__arrow">→</span>
          </button>
          <button className="btn btn--ghost" onClick={() => setCurrentPage('ai-buddy')}>
            {t.cta2}
          </button>
        </div>
      </div>
    </section>
  );
}

export default CTA;
