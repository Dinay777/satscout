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
// import SocialProof from './components/SocialProof'; // re-enable when we have real reviews
import PhotoGallery from './components/PhotoGallery';
import About from './components/About';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Progress from './components/Progress';
import Footer from './components/Footer';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import { identify, resetAnalytics } from './lib/analytics';

function App() {
  // Persist the active page so a real reload (or Supabase re-hydrating the tab)
  // keeps the user where they were instead of bouncing them to home/dashboard.
  const [currentPage, setCurrentPage] = useState(() => {
    try { return sessionStorage.getItem('satscout_page') || 'home'; } catch (e) { return 'home'; }
  });
  const [language, setLanguage]       = useState('en');
  const [user, setUser]               = useState(null);
  const [profile, setProfile]         = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pendingChatMessage, setPendingChatMessage] = useState(null);

  // ── Auth listener ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Supabase fires this on tab refocus (token refresh) too. Only swap the user
    // object when the ID actually changes — otherwise a new reference would
    // needlessly re-run the profile fetch and yank the page around on every
    // tab switch.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextId = session?.user?.id ?? null;
      setUser(prev => (prev?.id === nextId ? prev : (session?.user ?? null)));
    });

    return () => subscription.unsubscribe();
  }, []);

  // Remember the active page across reloads / tab re-hydration.
  useEffect(() => {
    try { sessionStorage.setItem('satscout_page', currentPage); } catch (e) { /* ignore */ }
  }, [currentPage]);

  // ── Tie analytics events to the (anonymous UUID) user, reset on logout ──
  useEffect(() => {
    if (user) identify(user.id);
  }, [user]);

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
        setProfileLoading(false);
      })
      .catch(() => setProfileLoading(false));
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    resetAnalytics();
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
  const protectedPages = ['ai-buddy', 'dashboard', 'progress'];
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
          <HowItWorks language={language} />
          <PhotoGallery />
          {/* <SocialProof language={language} /> */}
          <ResourcePreview language={language} setCurrentPage={setCurrentPage} />
          <CTA language={language} setCurrentPage={setCurrentPage} />
        </>
      )}

      {currentPage === 'resources' && (
        <ResourceLibrary language={language} profile={profile} />
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
            pendingMessage={pendingChatMessage}
            onPendingMessageSent={() => setPendingChatMessage(null)}
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
          onStartPlan={() => {
            setPendingChatMessage(language === 'ru' ? 'Составить мой план подготовки →' : "Let's build my study plan →");
            setCurrentPage('ai-buddy');
          }}
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

      {currentPage === 'privacy' && (
        <Privacy language={language} />
      )}

      {currentPage === 'terms' && (
        <Terms language={language} />
      )}

      {currentPage !== 'ai-buddy' && (
        <Footer language={language} setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

export default App;
