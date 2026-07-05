import React from 'react';
import { useScrollReveal } from '../lib/useScrollReveal';

const ICONS = {
  book: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  sparkles: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
      <path d="M20 3v4m2-2h-4M4 17v2m1-1H3"/>
    </svg>
  ),
  calendar: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <path d="M9 16l2 2 4-4"/>
    </svg>
  ),
  barchart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
};

const text = {
  en: {
    sectionLabel: 'What you get',
    sectionTitle: 'Everything you need to ace the SAT',
    features: [
      {
        iconKey: 'book',
        iconColor: 'blue',
        title: 'Curated Resource Library',
        description: "Books, videos, apps, and practice tests, sorted by section and difficulty so you can actually find what you need.",
        tag: 'Free',
        tagVariant: 'green'
      },
      {
        iconKey: 'sparkles',
        iconColor: 'purple',
        title: 'AI Study Buddy',
        description: 'Ask questions, get explanations, break down tricky problems, and build a personalized study plan. Available in English and Russian.',
        tag: 'AI-Powered',
        tagVariant: 'purple'
      },
      {
        iconKey: 'calendar',
        iconColor: 'teal',
        title: 'Study Planner',
        description: 'Enter your test date, current score, and goal — get a week-by-week plan with specific resources. Your personal SAT roadmap.',
        tag: 'New',
        tagVariant: 'blue'
      },
      {
        iconKey: 'barchart',
        iconColor: 'orange',
        title: 'Progress Dashboard',
        description: 'Track your score growth week by week. See today\'s tasks, your estimated score, and how far you\'ve come — all in one view.',
        tag: 'New',
        tagVariant: 'orange'
      }
    ]
  },
  ru: {
    sectionLabel: 'Что внутри',
    sectionTitle: 'Всё, что нужно для подготовки к SAT',
    features: [
      {
        iconKey: 'book',
        iconColor: 'blue',
        title: 'Библиотека ресурсов',
        description: 'Книги, видео, приложения и тесты — разложены по разделам и сложности, чтобы ты сразу нашёл нужное.',
        tag: 'Бесплатно',
        tagVariant: 'green'
      },
      {
        iconKey: 'sparkles',
        iconColor: 'purple',
        title: 'AI Помощник',
        description: 'Задавай вопросы, разбирай задачи, получай объяснения и составляй план подготовки. На английском и русском.',
        tag: 'AI',
        tagVariant: 'purple'
      },
      {
        iconKey: 'calendar',
        iconColor: 'teal',
        title: 'Планировщик',
        description: 'Введи дату экзамена, текущий и целевой балл — получи план по неделям с конкретными ресурсами.',
        tag: 'Новое',
        tagVariant: 'blue'
      },
      {
        iconKey: 'barchart',
        iconColor: 'orange',
        title: 'Дашборд прогресса',
        description: 'Следи за ростом баллов по неделям. Задачи на сегодня, прогноз результата и пройденный путь — всё в одном месте.',
        tag: 'Новое',
        tagVariant: 'orange'
      }
    ]
  }
};

function Features({ language, setCurrentPage }) {
  const t = text[language];
  const sectionRef = useScrollReveal();

  return (
    <section className="features">
      <div className="features__inner reveal" ref={sectionRef}>
        <span className="features__label">{t.sectionLabel}</span>
        <h2 className="features__title">{t.sectionTitle}</h2>

        <div className="features__grid">
          {t.features.map((feature, index) => (
            <div
              className="feature-card"
              key={index}
              style={{ '--stagger': `${index * 80}ms` }}
            >
              <div className="feature-card__header">
                <div className={`feature-card__icon-wrap feature-card__icon-wrap--${feature.iconColor}`}>
                  {ICONS[feature.iconKey]}
                </div>
                <span className={`feature-card__tag feature-card__tag--${feature.tagVariant}`}>
                  {feature.tag}
                </span>
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
