import React from 'react';

const text = {
  en: {
    label: 'Sneak peek',
    title: 'What\'s inside the library',
    subtitle: "24 free resources in the full library. Here are three we'd start with.",
    cta: 'See all 24 resources, all free →',
    resources: [
      { title: 'Khan Academy SAT Prep', type: 'Website', section: 'All Sections', difficulty: 'All Levels', price: 'Free', rating: '⭐ 4.9', color: 'blue', description: 'Official College Board partner. Personalized practice with thousands of questions and video lessons.' },
      { title: 'The Official Digital SAT Study Guide', type: 'Book', section: 'All Sections', difficulty: 'All Levels', price: '$26', rating: '⭐ 4.7', color: 'orange', description: 'Straight from College Board. 4 full practice tests with detailed explanations.' },
      { title: 'Desmos Graphing Calculator', type: 'Tool', section: 'Math', difficulty: 'All Levels', price: 'Free', rating: '⭐ 4.8', color: 'green', description: 'The same calculator used on the actual SAT. Master it before test day.' },
    ]
  },
  ru: {
    label: 'Заглянем внутрь',
    title: 'Что в библиотеке',
    subtitle: '24 бесплатных ресурса в библиотеке. Вот три, с которых стоит начать.',
    cta: 'Смотреть все 24 ресурса, бесплатно →',
    resources: [
      { title: 'Khan Academy SAT Prep', type: 'Сайт', section: 'Все разделы', difficulty: 'Все уровни', price: 'Бесплатно', rating: '⭐ 4.9', color: 'blue', description: 'Официальный партнёр College Board. Персональная практика с тысячами задач и видео.' },
      { title: 'The Official Digital SAT Study Guide', type: 'Книга', section: 'Все разделы', difficulty: 'Все уровни', price: '$26', rating: '⭐ 4.7', color: 'orange', description: 'От College Board. 4 полных практических теста с подробными объяснениями.' },
      { title: 'Desmos Graphing Calculator', type: 'Инструмент', section: 'Математика', difficulty: 'Все уровни', price: 'Бесплатно', rating: '⭐ 4.8', color: 'green', description: 'Тот самый калькулятор с настоящего SAT. Освой его до экзамена.' },
    ]
  }
};

function ResourcePreview({ language, setCurrentPage }) {
  const t = text[language];

  return (
    <section className="resource-preview">
      <div className="resource-preview__inner">
        <span className="section-label">{t.label}</span>
        <h2 className="section-title">{t.title}</h2>
        <p className="section-subtitle">{t.subtitle}</p>
        
        <div className="resource-preview__grid">
          {t.resources.map((resource, index) => (
            <div className={`resource-card resource-card--${resource.color}`} key={index}>
              <div className="resource-card__top">
                <span className="resource-card__type">{resource.type}</span>
                <span className="resource-card__rating">{resource.rating}</span>
              </div>
              <h3 className="resource-card__title">{resource.title}</h3>
              <p className="resource-card__description">{resource.description}</p>
              <div className="resource-card__tags">
                <span className="resource-card__tag">{resource.section}</span>
                <span className="resource-card__tag">{resource.difficulty}</span>
                <span className="resource-card__tag resource-card__tag--price">{resource.price}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="resource-preview__cta">
          <button className="btn btn--primary btn--lg" onClick={() => setCurrentPage('resources')}>
            {t.cta}
          </button>
        </div>
      </div>
    </section>
  );
}

export default ResourcePreview;
