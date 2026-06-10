import React from 'react';
import { useScrollReveal } from '../lib/useScrollReveal';

const text = {
  en: {
    label: 'How it works',
    title: 'From confused to confident in 3 steps',
    steps: [
      {
        number: '01',
        title: 'Explore Resources',
        description: 'Browse our hand-picked library of the best SAT prep materials — filtered by section, difficulty, and format. No more googling for hours.',
        color: 'blue'
      },
      {
        number: '02',
        title: 'Ask Your AI Buddy',
        description: 'Stuck on a problem? Need a study plan? Just ask. Our AI tutor explains concepts, breaks down questions, and adapts to your level.',
        color: 'teal'
      },
      {
        number: '03',
        title: 'Crush the SAT',
        description: 'Follow your personalized plan, track your progress, and walk into test day knowing you\'re ready. It\'s that simple.',
        color: 'green'
      }
    ]
  },
  ru: {
    label: 'Как это работает',
    title: 'От растерянности к уверенности за 3 шага',
    steps: [
      {
        number: '01',
        title: 'Изучи ресурсы',
        description: 'Просмотри нашу отобранную библиотеку лучших материалов для SAT — с фильтрами по разделу, сложности и формату.',
        color: 'blue'
      },
      {
        number: '02',
        title: 'Спроси AI помощника',
        description: 'Застрял на задаче? Нужен план? Просто спроси. AI-тьютор объяснит концепт, разберёт вопрос и адаптируется под твой уровень.',
        color: 'teal'
      },
      {
        number: '03',
        title: 'Сдай SAT на отлично',
        description: 'Следуй персональному плану, отслеживай прогресс и приходи на экзамен с уверенностью. Всё просто.',
        color: 'green'
      }
    ]
  }
};

function HowItWorks({ language }) {
  const t = text[language];
  const sectionRef = useScrollReveal();

  return (
    <section className="how-it-works">
      <div className="how-it-works__inner reveal" ref={sectionRef}>

        <div className="how-it-works__left">
          <span className="section-label">{t.label}</span>
          <h2 className="section-title">{t.title}</h2>

          <div className="steps">
            {t.steps.map((step, index) => (
              <div className={`step step--${step.color}`} key={index}>
                <div className="step__number">{step.number}</div>
                <div className="step__content">
                  <h3 className="step__title">{step.title}</h3>
                  <p className="step__description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="how-it-works__right">
          <div className="how-it-works__photo-wrap">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=650&fit=crop&auto=format&q=80"
              alt="Students studying together with laptops"
              className="how-it-works__photo"
              loading="lazy"
            />
            <div className="how-it-works__photo-badge">
              <span className="how-it-works__photo-badge-num">1400+</span>
              <span className="how-it-works__photo-badge-label">Target score</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;
