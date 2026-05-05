import React from 'react';

const text = {
  en: {
    sectionLabel: 'What you get',
    sectionTitle: 'Everything you need to ace the SAT',
    features: [
      {
        icon: '📚',
        title: 'Curated Resource Library',
        description: 'Hand-picked books, videos, apps, and practice tests — organized by section, difficulty, and type. No fluff, only what actually works.',
        tag: 'Free'
      },
      {
        icon: '🤖',
        title: 'AI Study Buddy',
        description: 'Ask questions, get explanations, break down tricky problems, and build a personalized study plan. Available in English and Russian.',
        tag: 'AI-Powered'
      },
      {
        icon: '🗺️',
        title: 'Study Planner',
        description: 'Enter your test date, current score, and goal — get a week-by-week plan with specific resources. Your personal SAT roadmap.',
        tag: 'Coming Soon'
      },
      {
        icon: '🌍',
        title: 'Summer Programs Guide',
        description: 'Explore top summer programs and get expert guidance on applications, essays, and selection — from someone who\'s been through it.',
        tag: 'Consulting'
      }
    ]
  },
  ru: {
    sectionLabel: 'Что внутри',
    sectionTitle: 'Всё, что нужно для подготовки к SAT',
    features: [
      {
        icon: '📚',
        title: 'Библиотека ресурсов',
        description: 'Отобранные книги, видео, приложения и тесты — по разделам, сложности и типу. Только то, что реально работает.',
        tag: 'Бесплатно'
      },
      {
        icon: '🤖',
        title: 'AI Помощник',
        description: 'Задавай вопросы, разбирай задачи, получай объяснения и составляй план подготовки. На английском и русском.',
        tag: 'AI'
      },
      {
        icon: '🗺️',
        title: 'Планировщик',
        description: 'Введи дату экзамена, текущий и целевой балл — получи план по неделям с конкретными ресурсами.',
        tag: 'Скоро'
      },
      {
        icon: '🌍',
        title: 'Летние программы',
        description: 'Узнай о лучших летних школах и получи помощь с подачей заявки, эссе и выбором программы.',
        tag: 'Консалтинг'
      }
    ]
  }
};

function Features({ language, setCurrentPage }) {
  const t = text[language];

  return (
    <section className="features">
      <div className="features__inner">
        <span className="features__label">{t.sectionLabel}</span>
        <h2 className="features__title">{t.sectionTitle}</h2>
        
        <div className="features__grid">
          {t.features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-card__header">
                <span className="feature-card__icon">{feature.icon}</span>
                <span className="feature-card__tag">{feature.tag}</span>
              </div>
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
