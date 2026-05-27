import React, { useState, useEffect } from 'react';

const text = {
  en: {
    resources: 'Resources',
    aiBuddy: 'AI Study Buddy',
    about: 'About',
    dashboard: 'Dashboard',
    progress: 'Progress',
    signIn: 'Sign In',
    signOut: 'Sign out',
  },
  ru: {
    resources: 'Ресурсы',
    aiBuddy: 'AI Помощник',
    about: 'О нас',
    dashboard: 'Кабинет',
    progress: 'Прогресс',
    signIn: 'Войти',
    signOut: 'Выйти',
  }
};

function Navbar({ currentPage, setCurrentPage, language, setLanguage, user, onSignOut }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const t = text[language];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    if (!userMenuOpen) return;
    const close = () => setUserMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [userMenuOpen]);

  const navigate = (page) => {
    setCurrentPage(page);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? '?';

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
          {/* programs tab hidden — will return for application season */}
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

          {/* Auth */}
          {user ? (
            <>
              <button
                className={`navbar__link ${currentPage === 'dashboard' ? 'navbar__link--active' : ''}`}
                onClick={() => navigate('dashboard')}
              >
                {t.dashboard}
              </button>
              <button
                className={`navbar__link ${currentPage === 'progress' ? 'navbar__link--active' : ''}`}
                onClick={() => navigate('progress')}
              >
                {t.progress}
              </button>
              <div className="navbar__user" onClick={e => { e.stopPropagation(); setUserMenuOpen(o => !o); }}>
                <div className="navbar__avatar">{avatarLetter}</div>
                {userMenuOpen && (
                  <div className="navbar__user-menu">
                    <span className="navbar__user-email">{user.email}</span>
                    <button className="navbar__user-signout" onClick={onSignOut}>
                      {t.signOut}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              className="navbar__signin"
              onClick={() => navigate('ai-buddy')}
            >
              {t.signIn}
            </button>
          )}
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
