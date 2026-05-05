import React, { useState, useEffect } from 'react';

const text = {
  en: {
    resources: 'Resources',
    aiBuddy: 'AI Study Buddy',
    programs: 'Summer Programs',
    about: 'About',
  },
  ru: {
    resources: 'Ресурсы',
    aiBuddy: 'AI Помощник',
    programs: 'Летние школы',
    about: 'О нас',
  }
};

function Navbar({ currentPage, setCurrentPage, language, setLanguage }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = text[language];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <button className="navbar__logo" onClick={() => navigate('home')}>
          <span className="navbar__logo-icon">◎</span>
          <span className="navbar__logo-text">SAT<span className="navbar__logo-accent">Scout</span></span>
        </button>

        <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <button 
            className={`navbar__link ${currentPage === 'resources' ? 'navbar__link--active' : ''}`}
            onClick={() => navigate('resources')}
          >
            {t.resources}
          </button>
          <button 
            className={`navbar__link ${currentPage === 'ai-buddy' ? 'navbar__link--active' : ''}`}
            onClick={() => navigate('ai-buddy')}
          >
            {t.aiBuddy}
          </button>
          <button 
            className={`navbar__link ${currentPage === 'programs' ? 'navbar__link--active' : ''}`}
            onClick={() => navigate('programs')}
          >
            {t.programs}
          </button>
          <button 
            className={`navbar__link ${currentPage === 'about' ? 'navbar__link--active' : ''}`}
            onClick={() => navigate('about')}
          >
            {t.about}
          </button>
          
          <button 
            className="navbar__lang"
            onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
          >
            {language === 'en' ? 'RU' : 'EN'}
          </button>
        </div>

        <button 
          className={`navbar__burger ${menuOpen ? 'navbar__burger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
