import React from 'react';

const text = {
  en: {
    label: 'Sneak peek',
    title: 'What\'s inside the library',
    subtitle: 'Here are some of the top resources our community loves',
    cta: 'View All Resources →',
    resources: [
      { title: 'Khan Academy SAT Prep', type: 'Website', section: 'All Sections', difficulty: 'All Levels', price: 'Free', rating: '⭐ 4.9', color: 'blue', description: 'Official College Board partner. Personalized practice with thousands of questions and video lessons.' },
      { title: 'The Official Digital SAT Study Guide', type: 'Book', section: 'All Sections', difficulty: 'All Levels', price: '$26', rating: '⭐ 4.7', color: 'orange', description: 'Straight from College Board. 4 full practice tests with detailed explanations.' },
      { title: 'Desmos Graphing Calculator', type: 'Tool', section: 'Math', difficulty: 'All Levels', price: 'Free', rating: '⭐ 4.8', color: 'green', description: 'The same calculator used on the actual SAT. Practice with it before test day.' },
      { title: '1600.io', type: 'Video Course', section: 'All Sections', difficulty: 'Intermediate', price: 'Free + Paid', rating: '⭐ 4.8', color: 'purple', description: 'Expert video explanations for every official SAT question. George\'s teaching style is legendary.' },
      { title: 'Erica Meltzer Reading Book', type: 'Book', section: 'Reading', difficulty: 'Intermediate', price: '$32', rating: '⭐ 4.6', color: 'teal', description: 'The gold standard for SAT Reading prep. Systematic approach to every question type.' },
      { title: 'College Panda Math', type: 'Book', section: 'Math', difficulty: 'Advanced', price: '$25', rating: '⭐ 4.7', color: 'pink', description: 'Best math prep book for students aiming for 750+. Clear explanations with plenty of practice.' },
    ]
  },
  ru: {
    label: 'Заглянем внутрь',
    title: 'Что в библиотеке',
    subtitle: 'Некоторые из лучших ресурсов, которые любит наше сообщество',
    cta: 'Все ресурсы →',
    resources: [
      { title: 'Khan Academy SAT Prep', type: 'Сайт', section: 'Все разделы', difficulty: 'Все уровни', price: 'Бесплатно', rating: '⭐ 4.9', color: 'blue', description: 'Официальный партнёр College Board. Персональная практика с тысячами задач и видео.' },
      { title: 'The Official Digital SAT Study Guide', type: 'Книга', section: 'Все разделы', difficulty: 'Все уровни', price: '$26', rating: '⭐ 4.7', color: 'orange', description: 'От College Board. 4 полных практических теста с подробными объяснениями.' },
      { title: 'Desmos Graphing Calculator', type: 'Инструмент', section: 'Математика', difficulty: 'Все уровни', price: 'Бесплатно', rating: '⭐ 4.8', color: 'green', description: 'Тот самый калькулятор с настоящего SAT. Потренируйся до экзамена.' },
      { title: '1600.io', type: 'Видеокурс', section: 'Все разделы', difficulty: 'Средний', price: 'Бесплатно + платно', rating: '⭐ 4.8', color: 'purple', description: 'Экспертные видео-разборы каждого официального вопроса SAT.' },
      { title: 'Erica Meltzer Reading Book', type: 'Книга', section: 'Чтение', difficulty: 'Средний', price: '$32', rating: '⭐ 4.6', color: 'teal', description: 'Золотой стандарт подготовки к Reading. Системный подход к каждому типу вопросов.' },
      { title: 'College Panda Math', type: 'Книга', section: 'Математика', difficulty: 'Продвинутый', price: '$25', rating: '⭐ 4.7', color: 'pink', description: 'Лучшая книга по математике для тех, кто целится на 750+.' },
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
