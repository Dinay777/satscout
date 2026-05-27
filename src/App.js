import React, { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './lib/supabase';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import ResourcePreview from './components/ResourcePreview';
import CTA from './components/CTA';
import ResourceLibrary from './components/ResourceLibrary';
import AIChatBuddy from './components/AIChatBuddy';
import SummerPrograms from './components/SummerPrograms';
// import SocialProof from './components/SocialProof'; // uncomment when real testimonials are ready
import PhotoGallery from './components/PhotoGallery';
import About from './components/About';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Progress from './components/Progress';
import Footer from './components/Footer';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [language, setLanguage]       = useState('en');
  const [user, setUser]               = useState(null);
  const [profile, setProfile]         = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Auth listener ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch profile whenever user changes ──
  useEffect(() => {
    if (!user) { setProfile(null); return; }

    setProfileLoading(true);
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(async ({ data }) => {
        if (!data) {
          // Verify the session is still valid server-side
          const { error: authError } = await supabase.auth.getUser();
          if (authError) {
            // Stale session — sign out silently
            await supabase.auth.signOut();
            setUser(null);
            setProfileLoading(false);
            return;
          }
        }
        setProfile(data ?? null);
        if (data) setCurrentPage('dashboard');
        setProfileLoading(false);
      });
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setCurrentPage('home');
  };

  const handleOnboardingComplete = (profileData) => {
    setProfile(profileData);
    setCurrentPage('dashboard');
  };

  // ── Loading states ──
  if (authLoading || profileLoading) {
    return (
      <div className="auth-loading">
        <span className="auth-loading__icon">◎</span>
      </div>
    );
  }

  // ── Onboarding (logged in but no profile yet) ──
  if (user && !profile) {
    return (
      <Onboarding
        user={user}
        language={language}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // ── Protected pages: redirect to auth ──
  const protectedPages = ['ai-buddy', 'dashboard'];
  if (protectedPages.includes(currentPage) && !user) {
    return (
      <>
        <Navbar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          language={language}
          setLanguage={setLanguage}
          user={user}
          onSignOut={handleSignOut}
        />
        <Auth language={language} onAuth={(u) => setUser(u)} />
      </>
    );
  }

  return (
    <div className="App">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        language={language}
        setLanguage={setLanguage}
        user={user}
        onSignOut={handleSignOut}
      />

      {currentPage === 'home' && (
        <>
          <Hero language={language} setCurrentPage={setCurrentPage} />
          <Features language={language} setCurrentPage={setCurrentPage} />
          <PhotoGallery />
          {/* <SocialProof language={language} /> */}
          <HowItWorks language={language} />
          <ResourcePreview language={language} setCurrentPage={setCurrentPage} />
          <CTA language={language} setCurrentPage={setCurrentPage} />
        </>
      )}

      {currentPage === 'resources' && (
        <ResourceLibrary language={language} />
      )}

      {/* Keep mounted to preserve chat history — hide with CSS when not active */}
      {user && (
        <div style={{ display: currentPage === 'ai-buddy' ? 'contents' : 'none' }}>
          <AIChatBuddy
            language={language}
            user={user}
            profile={profile}
            onProfileUpdate={(updated) => setProfile(updated)}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}

      {currentPage === 'dashboard' && profile && (
        <Dashboard
          user={user}
          profile={profile}
          language={language}
          setCurrentPage={setCurrentPage}
          onProfileUpdate={(updated) => setProfile(updated)}
        />
      )}

      {currentPage === 'progress' && profile && (
        <Progress
          user={user}
          profile={profile}
          language={language}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'programs' && (
        <SummerPrograms language={language} />
      )}

      {currentPage === 'about' && (
        <About language={language} />
      )}

      {currentPage !== 'ai-buddy' && (
        <Footer language={language} setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

export default App;
