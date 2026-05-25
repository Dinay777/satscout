import React from 'react';

const text = {
  en: {
    description: 'Free SAT prep platform with curated resources and AI-powered study help. Built by a student, for students.',
    resources: 'Resources',
    aiBuddy: 'AI Study Buddy',
    programs: 'Summer Programs',
    about: 'About',
    copyright: '© 2026 SATScout. All rights reserved.',
    madeWith: 'Made with ♥ in Houston, TX'
  },
  ru: {
    description: 'Бесплатная платформа для подготовки к SAT с проверенными ресурсами и AI-помощником. Создано студентом для студентов.',
    resources: 'Ресурсы',
    aiBuddy: 'AI Помощник',
    programs: 'Летние школы',
    about: 'О нас',
    copyright: '© 2026 SATScout. Все права защищены.',
    madeWith: 'Сделано с ♥ в Хьюстоне, TX'
  }
};

function Footer({ language, setCurrentPage }) {
  const t = text[language];

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="navbar__logo-icon">◎</span>
            <span className="navbar__logo-text">SAT<span className="navbar__logo-accent">Scout</span></span>
          </div>
          <p className="footer__description">{t.description}</p>
        </div>
        
        <div className="footer__links">
          <button onClick={() => setCurrentPage('resources')}>{t.resources}</button>
          <button onClick={() => setCurrentPage('ai-buddy')}>{t.aiBuddy}</button>
          <button onClick={() => setCurrentPage('about')}>{t.about}</button>
        </div>
      </div>
      
      <div className="footer__bottom">
        <span>{t.copyright}</span>
        <span>{t.madeWith}</span>
      </div>
    </footer>
  );
}

export default Footer;
