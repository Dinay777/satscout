import React, { useState, useMemo } from 'react';
import resources from '../data/resources';

const text = {
  en: {
    title: 'Resource Library',
    subtitle: 'Hand-picked SAT prep resources, organized and rated. Find exactly what you need.',
    filterSection: 'Section',
    filterType: 'Type',
    filterDifficulty: 'Difficulty',
    filterPrice: 'Price',
    all: 'All',
    sections: ['Reading', 'Writing', 'Math'],
    types: ['Book', 'Website', 'Video Course', 'App', 'Tool', 'Practice Test', 'Community'],
    difficulties: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    prices: ['Free', 'Paid', 'Free + Paid'],
    recommended: '★ Top Pick',
    viewResource: 'Open Resource →',
    findInLibrary: 'Find in Library',
    results: 'resources found',
    noResults: 'No resources match your filters. Try adjusting them.',
    clearFilters: 'Clear all filters',
  },
  ru: {
    title: 'Библиотека ресурсов',
    subtitle: 'Отобранные ресурсы для SAT, организованные и оценённые. Найди то, что тебе нужно.',
    filterSection: 'Раздел',
    filterType: 'Тип',
    filterDifficulty: 'Сложность',
    filterPrice: 'Цена',
    all: 'Все',
    sections: ['Reading', 'Writing', 'Math'],
    types: ['Книга', 'Сайт', 'Видеокурс', 'Приложение', 'Инструмент', 'Тесты', 'Сообщество'],
    difficulties: ['Начинающий', 'Средний', 'Продвинутый', 'Все уровни'],
    prices: ['Бесплатно', 'Платно', 'Бесплатно + Платно'],
    recommended: '★ Рекомендуем',
    viewResource: 'Открыть →',
    findInLibrary: 'Найти в библиотеке',
    results: 'ресурсов найдено',
    noResults: 'Ничего не найдено. Попробуй изменить фильтры.',
    clearFilters: 'Сбросить фильтры',
  }
};

function ResourceLibrary({ language }) {
  const t = text[language];
  const [sectionFilter, setSectionFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchesSection = sectionFilter === 'All' || r.section.includes(sectionFilter);
      const matchesType = typeFilter === 'All' || r.type === typeFilter;
      const matchesDifficulty = difficultyFilter === 'All' || r.difficulty === difficultyFilter;
      const matchesPrice = priceFilter === 'All' || r.price === priceFilter;
      const matchesSearch = searchQuery === '' || 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSection && matchesType && matchesDifficulty && matchesPrice && matchesSearch;
    });
  }, [sectionFilter, typeFilter, difficultyFilter, priceFilter, searchQuery]);

  const clearFilters = () => {
    setSectionFilter('All');
    setTypeFilter('All');
    setDifficultyFilter('All');
    setPriceFilter('All');
    setSearchQuery('');
  };

  const hasActiveFilters = sectionFilter !== 'All' || typeFilter !== 'All' || 
    difficultyFilter !== 'All' || priceFilter !== 'All' || searchQuery !== '';

  const colorMap = {
    'Book': 'orange',
    'Website': 'blue',
    'Video Course': 'purple',
    'App': 'green',
    'Tool': 'teal',
    'Practice Test': 'pink',
    'Community': 'teal',
  };

  return (
    <section className="library">
      <div className="library__inner">
        <div className="library__header">
          <h1 className="library__title">{t.title}</h1>
          <p className="library__subtitle">{t.subtitle}</p>
        </div>

        <div className="library__search">
          <span className="library__search-icon">🔍</span>
          <input
            type="text"
            className="library__search-input"
            placeholder={language === 'en' ? 'Search resources...' : 'Поиск ресурсов...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="library__filters">
          <div className="filter-group">
            <label className="filter-group__label">{t.filterSection}</label>
            <div className="filter-group__options">
              <button 
                className={`filter-btn ${sectionFilter === 'All' ? 'filter-btn--active' : ''}`}
                onClick={() => setSectionFilter('All')}
              >{t.all}</button>
              {t.sections.map((s, i) => (
                <button 
                  key={i}
                  className={`filter-btn ${sectionFilter === ['Reading','Writing','Math'][i] ? 'filter-btn--active' : ''}`}
                  onClick={() => setSectionFilter(['Reading','Writing','Math'][i])}
                >{s}</button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-group__label">{t.filterType}</label>
            <div className="filter-group__options">
              <button 
                className={`filter-btn ${typeFilter === 'All' ? 'filter-btn--active' : ''}`}
                onClick={() => setTypeFilter('All')}
              >{t.all}</button>
              {['Book', 'Website', 'Video Course', 'App', 'Tool', 'Practice Test', 'Community'].map((type, i) => (
                <button 
                  key={i}
                  className={`filter-btn ${typeFilter === type ? 'filter-btn--active' : ''}`}
                  onClick={() => setTypeFilter(type)}
                >{language === 'en' ? type : t.types[i]}</button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-group__label">{t.filterPrice}</label>
            <div className="filter-group__options">
              <button 
                className={`filter-btn ${priceFilter === 'All' ? 'filter-btn--active' : ''}`}
                onClick={() => setPriceFilter('All')}
              >{t.all}</button>
              {['Free', 'Paid', 'Free + Paid'].map((p, i) => (
                <button 
                  key={i}
                  className={`filter-btn ${priceFilter === p ? 'filter-btn--active' : ''}`}
                  onClick={() => setPriceFilter(p)}
                >{language === 'en' ? p : t.prices[i]}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="library__meta">
          <span className="library__count">{filteredResources.length} {t.results}</span>
          {hasActiveFilters && (
            <button className="library__clear" onClick={clearFilters}>{t.clearFilters}</button>
          )}
        </div>

        {filteredResources.length === 0 ? (
          <div className="library__empty">
            <p>{t.noResults}</p>
          </div>
        ) : (
          <div className="library__grid">
            {filteredResources.map(resource => (
              <div className={`lib-card lib-card--${colorMap[resource.type] || 'blue'}`} key={resource.id}>
                {resource.recommended && (
                  <div className="lib-card__recommended">{t.recommended}</div>
                )}
                <div className="lib-card__top">
                  <span className="lib-card__type">{resource.type}</span>
                  <span className="lib-card__rating">{'⭐'.repeat(1)} {resource.rating}</span>
                </div>
                <h3 className="lib-card__title">{resource.title}</h3>
                <p className="lib-card__description">
                  {language === 'ru' && resource.descriptionRu ? resource.descriptionRu : resource.description}
                </p>
                <div className="lib-card__tags">
                  {resource.section.map((s, i) => (
                    <span className="lib-card__tag" key={i}>{s}</span>
                  ))}
                  <span className="lib-card__tag">{resource.difficulty}</span>
                  <span className="lib-card__tag lib-card__tag--price">{resource.priceAmount}</span>
                </div>
                <div className="lib-card__actions">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="lib-card__link">
                    {t.viewResource}
                  </a>
                  {resource.worldcat && (
                    <a href={resource.worldcat} target="_blank" rel="noopener noreferrer" className="lib-card__library-link">
                      📖 {t.findInLibrary}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ResourceLibrary;
