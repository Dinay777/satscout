import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const text = {
  en: {
    loginTitle: 'Welcome back',
    loginSubtitle: 'Sign in to your SATScout account',
    registerTitle: 'Create your account',
    registerSubtitle: 'Free forever. No credit card needed.',
    email: 'Email address',
    password: 'Password',
    passwordHint: 'At least 6 characters',
    loginBtn: 'Sign in',
    registerBtn: 'Create account',
    loginLoading: 'Signing in...',
    registerLoading: 'Creating account...',
    switchToRegister: "Don't have an account?",
    switchToRegisterLink: 'Sign up free',
    switchToLogin: 'Already have an account?',
    switchToLoginLink: 'Sign in',
    checkEmail: 'Check your email! We sent a confirmation link to',
    forgotPassword: 'Forgot password?',
    badge: 'Free · No credit card',
  },
  ru: {
    loginTitle: 'С возвращением',
    loginSubtitle: 'Войди в свой аккаунт SATScout',
    registerTitle: 'Создай аккаунт',
    registerSubtitle: 'Бесплатно навсегда. Без карты.',
    email: 'Email адрес',
    password: 'Пароль',
    passwordHint: 'Минимум 6 символов',
    loginBtn: 'Войти',
    registerBtn: 'Создать аккаунт',
    loginLoading: 'Входим...',
    registerLoading: 'Создаём аккаунт...',
    switchToRegister: 'Нет аккаунта?',
    switchToRegisterLink: 'Зарегистрироваться',
    switchToLogin: 'Уже есть аккаунт?',
    switchToLoginLink: 'Войти',
    checkEmail: 'Проверь почту! Мы отправили письмо на',
    forgotPassword: 'Забыл пароль?',
    badge: 'Бесплатно · Без карты',
  },
};

function Auth({ language, onAuth }) {
  const t = text[language];
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        setSuccess(email);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setSuccess(email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
    setSuccess('');
  };

  const isLogin = mode === 'login';

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo__icon">◎</span>
          <span className="auth-logo__text">SAT<span className="auth-logo__accent">Scout</span></span>
        </div>

        {/* Header */}
        <div className="auth-header">
          <span className="auth-badge">{t.badge}</span>
          <h1 className="auth-title">{isLogin ? t.loginTitle : t.registerTitle}</h1>
          <p className="auth-subtitle">{isLogin ? t.loginSubtitle : t.registerSubtitle}</p>
        </div>

        {/* Success state */}
        {success ? (
          <div className="auth-success">
            <div className="auth-success__icon">✉</div>
            <p className="auth-success__text">
              {t.checkEmail} <strong>{success}</strong>
            </p>
            {mode === 'forgot' && (
              <button className="auth-switch__link" style={{ marginTop: 16 }} onClick={() => { setMode('login'); setSuccess(''); }}>
                {language === 'en' ? '← Back to sign in' : '← Назад ко входу'}
              </button>
            )}
          </div>
        ) : mode === 'forgot' ? (
          <form className="auth-form" onSubmit={handleForgotPassword}>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: 16 }}>
              {language === 'en'
                ? 'Enter your email and we\'ll send you a reset link.'
                : 'Введи email и мы отправим ссылку для сброса пароля.'}
            </p>
            <div className="auth-field">
              <label className="auth-label">{t.email}</label>
              <input
                type="email"
                className="auth-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading
                ? (language === 'en' ? 'Sending...' : 'Отправляем...')
                : (language === 'en' ? 'Send reset link' : 'Отправить ссылку')}
            </button>
            <button type="button" className="auth-switch__link" style={{ display: 'block', marginTop: 12 }} onClick={() => { setMode('login'); setError(''); }}>
              {language === 'en' ? '← Back to sign in' : '← Назад ко входу'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">{t.email}</label>
              <input
                type="email"
                className="auth-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label">{t.password}</label>
                {isLogin && (
                  <button type="button" className="auth-forgot" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}>
                    {t.forgotPassword}
                  </button>
                )}
              </div>
              <input
                type="password"
                className="auth-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isLogin ? '••••••••' : t.passwordHint}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? (isLogin ? t.loginLoading : t.registerLoading)
                : (isLogin ? t.loginBtn : t.registerBtn)}
            </button>
          </form>
        )}

        {/* Switch mode */}
        <p className="auth-switch">
          {isLogin ? t.switchToRegister : t.switchToLogin}{' '}
          <button className="auth-switch__link" onClick={switchMode}>
            {isLogin ? t.switchToRegisterLink : t.switchToLoginLink}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
