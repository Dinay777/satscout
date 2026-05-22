import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const steps = {
  en: [
    {
      id: 'target_score',
      question: "What's your target SAT score?",
      subtitle: "Dream big — we'll map every step to get you there.",
      type: 'single',
      options: [
        { label: '1000–1100', value: 1050 },
        { label: '1100–1200', value: 1150 },
        { label: '1200–1300', value: 1250 },
        { label: '1300–1400', value: 1350 },
        { label: '1400+', value: 1450, accent: true, sub: 'top 4%' },
      ],
    },
    {
      id: 'exam_timeframe',
      question: 'When is your test?',
      subtitle: "We'll build a plan that fits your timeline.",
      type: 'single',
      options: [
        { label: 'Under 4 weeks', value: 'under-4-weeks', sub: '⚡ crunch time' },
        { label: '1–2 months',    value: '1-2-months',    sub: 'focused sprint' },
        { label: '2–4 months',    value: '2-4-months',    sub: 'solid runway' },
        { label: '4–6 months',    value: '4-6-months',    sub: 'well prepared' },
        { label: '6+ months',     value: '6-months-plus', sub: 'plenty of time' },
      ],
    },
    {
      id: 'current_score',
      question: "What's your current score?",
      subtitle: "Don't worry if you haven't taken a practice test yet.",
      type: 'single',
      options: [
        { label: "Haven't taken one yet", value: 'none', sub: "that's totally fine" },
        { label: 'Below 900',             value: 'below-900' },
        { label: '900–1000',              value: '900-1000' },
        { label: '1000–1100',             value: '1000-1100' },
        { label: '1100–1200',             value: '1100-1200' },
        { label: '1200–1300',             value: '1200-1300' },
        { label: '1300+',                 value: '1300+' },
      ],
    },
    {
      id: 'weak_sections',
      question: 'Where do you want to focus?',
      subtitle: 'You can change this anytime.',
      type: 'multi',
      options: [
        { label: 'Reading & Writing', value: 'reading', emoji: '📖' },
        { label: 'Math',             value: 'math',    emoji: '📐' },
      ],
      nextLabel: 'Continue →',
    },
    {
      id: 'study_hours',
      question: 'How much can you study each week?',
      subtitle: 'Honest beats optimistic — consistency is what matters.',
      type: 'single',
      options: [
        { label: '1–3 hours',  value: '1-3',  sub: 'light' },
        { label: '4–6 hours',  value: '4-6',  sub: 'solid' },
        { label: '7–10 hours', value: '7-10', sub: 'serious' },
        { label: '10+ hours',  value: '10+',  sub: 'all in 🔥', accent: true },
      ],
    },
  ],
  ru: [
    {
      id: 'target_score',
      question: 'Какой балл SAT ты хочешь получить?',
      subtitle: 'Мечтай по-крупному — мы составим план для каждого шага.',
      type: 'single',
      options: [
        { label: '1000–1100', value: 1050 },
        { label: '1100–1200', value: 1150 },
        { label: '1200–1300', value: 1250 },
        { label: '1300–1400', value: 1350 },
        { label: '1400+', value: 1450, accent: true, sub: 'топ 4%' },
      ],
    },
    {
      id: 'exam_timeframe',
      question: 'Когда у тебя экзамен?',
      subtitle: 'Мы подстроим план под твои сроки.',
      type: 'single',
      options: [
        { label: 'Меньше 4 недель', value: 'under-4-weeks', sub: '⚡ срочно' },
        { label: '1–2 месяца',      value: '1-2-months',    sub: 'быстрый спринт' },
        { label: '2–4 месяца',      value: '2-4-months',    sub: 'хороший запас' },
        { label: '4–6 месяцев',     value: '4-6-months',    sub: 'отличный старт' },
        { label: '6+ месяцев',      value: '6-months-plus', sub: 'много времени' },
      ],
    },
    {
      id: 'current_score',
      question: 'Какой у тебя текущий балл?',
      subtitle: 'Не переживай, если ещё не сдавала пробный тест.',
      type: 'single',
      options: [
        { label: 'Ещё не сдавала',  value: 'none',       sub: 'всё нормально' },
        { label: 'Ниже 900',        value: 'below-900' },
        { label: '900–1000',        value: '900-1000' },
        { label: '1000–1100',       value: '1000-1100' },
        { label: '1100–1200',       value: '1100-1200' },
        { label: '1200–1300',       value: '1200-1300' },
        { label: '1300+',           value: '1300+' },
      ],
    },
    {
      id: 'weak_sections',
      question: 'На чём хочешь сосредоточиться?',
      subtitle: 'Это можно изменить в любой момент.',
      type: 'multi',
      options: [
        { label: 'Чтение и письмо', value: 'reading', emoji: '📖' },
        { label: 'Математика',      value: 'math',    emoji: '📐' },
      ],
      nextLabel: 'Продолжить →',
    },
    {
      id: 'study_hours',
      question: 'Сколько часов в неделю ты готова учиться?',
      subtitle: 'Честный ответ лучше оптимистичного — важна стабильность.',
      type: 'single',
      options: [
        { label: '1–3 часа',   value: '1-3',  sub: 'легко' },
        { label: '4–6 часов',  value: '4-6',  sub: 'стабильно' },
        { label: '7–10 часов', value: '7-10', sub: 'серьёзно' },
        { label: '10+ часов',  value: '10+',  sub: 'по полной 🔥', accent: true },
      ],
    },
  ],
};

function Onboarding({ user, language, onComplete }) {
  const lang = language === 'ru' ? 'ru' : 'en';
  const allSteps = steps[lang];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [multiSelected, setMultiSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const current = allSteps[step];
  const total = allSteps.length;
  const progress = ((step) / total) * 100;

  const handleSingle = async (value) => {
    const updated = { ...answers, [current.id]: value };
    setAnswers(updated);

    if (step < total - 1) {
      setStep(s => s + 1);
    } else {
      await saveProfile(updated);
    }
  };

  const toggleMulti = (value) => {
    setMultiSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleMultiNext = async () => {
    const selected = multiSelected.length > 0 ? multiSelected : ['reading', 'math'];
    const updated = { ...answers, [current.id]: selected };
    setAnswers(updated);

    if (step < total - 1) {
      setStep(s => s + 1);
      setMultiSelected([]);
    } else {
      await saveProfile(updated);
    }
  };

  const saveProfile = async (finalAnswers) => {
    setSaving(true);
    setError('');
    const { data, error: err } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        target_score:   finalAnswers.target_score,
        current_score:  finalAnswers.current_score,
        exam_timeframe: finalAnswers.exam_timeframe,
        weak_sections:  finalAnswers.weak_sections,
        study_hours:    finalAnswers.study_hours,
      })
      .select()
      .single();

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    onComplete(data);
  };

  if (saving) {
    return (
      <div className="onboarding-saving">
        <div className="onboarding-saving__icon">◎</div>
        <p>{lang === 'ru' ? 'Строим твой план...' : 'Building your plan...'}</p>
      </div>
    );
  }

  return (
    <div className="onboarding">
      {/* Header */}
      <div className="onboarding__top">
        <div className="onboarding__logo">
          <span className="onboarding__logo-icon">◎</span>
          <span className="onboarding__logo-text">SAT<span>Scout</span></span>
        </div>
        <span className="onboarding__step-count">{step + 1} / {total}</span>
      </div>

      {/* Progress bar */}
      <div className="onboarding__progress">
        <div className="onboarding__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Step content */}
      <div className="onboarding__body" key={step}>
        <h1 className="onboarding__question">{current.question}</h1>
        <p className="onboarding__subtitle">{current.subtitle}</p>

        {/* Single select */}
        {current.type === 'single' && (
          <div className="onboarding__options">
            {current.options.map(opt => (
              <button
                key={opt.value}
                className={`onboarding__option ${opt.accent ? 'onboarding__option--accent' : ''}`}
                onClick={() => handleSingle(opt.value)}
              >
                <span className="onboarding__option-label">
                  {opt.emoji && <span className="onboarding__option-emoji">{opt.emoji}</span>}
                  {opt.label}
                </span>
                {opt.sub && <span className="onboarding__option-sub">{opt.sub}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Multi select */}
        {current.type === 'multi' && (
          <>
            <div className="onboarding__options onboarding__options--multi">
              {current.options.map(opt => {
                const selected = multiSelected.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    className={`onboarding__option onboarding__option--big ${selected ? 'onboarding__option--selected' : ''}`}
                    onClick={() => toggleMulti(opt.value)}
                  >
                    <span className="onboarding__option-emoji">{opt.emoji}</span>
                    <span className="onboarding__option-label">{opt.label}</span>
                    <span className="onboarding__option-check">{selected ? '✓' : ''}</span>
                  </button>
                );
              })}
            </div>
            <button
              className="onboarding__next"
              onClick={handleMultiNext}
            >
              {current.nextLabel}
            </button>
          </>
        )}

        {error && <p className="onboarding__error">{error}</p>}
      </div>
    </div>
  );
}

export default Onboarding;
