import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import ResourcePreview from './components/ResourcePreview';
import CTA from './components/CTA';
import ResourceLibrary from './components/ResourceLibrary';
import AIChatBuddy from './components/AIChatBuddy';
import Footer from './components/Footer';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div className="App">
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        language={language}
        setLanguage={setLanguage}
      />
      
      {currentPage === 'home' && (
        <>
          <Hero language={language} setCurrentPage={setCurrentPage} />
          <Features language={language} setCurrentPage={setCurrentPage} />
          <HowItWorks language={language} />
          <ResourcePreview language={language} setCurrentPage={setCurrentPage} />
          <CTA language={language} setCurrentPage={setCurrentPage} />
        </>
      )}

      {currentPage === 'resources' && (
        <ResourceLibrary language={language} />
      )}

      {currentPage === 'ai-buddy' && (
        <AIChatBuddy language={language} />
      )}

      {currentPage !== 'ai-buddy' && (
        <Footer language={language} setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

export default App;
