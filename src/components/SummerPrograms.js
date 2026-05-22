import React, { useState } from 'react';

const text = {
  en: {
    // Hero
    badge: 'Summer Programs',
    title: 'Your Guide to Top',
    titleAccent: 'Summer Programs',
    subtitle: 'Find the right program, nail your application, and get in. This guide is built by someone who went through it — Harvard Summer School 2026.',
    harvardBadge: '🎓 Harvard Summer School 2026',
    harvardSub: 'Neuroscience & Biology',

    // Services
    servicesLabel: 'What I offer',
    servicesTitle: 'From research to acceptance',
    services: [
      {
        icon: '📖',
        tag: 'Free',
        tagColor: 'green',
        title: 'Free Resources',
        description: 'Articles and guides on how to choose a program, what to look for, and application timelines. No cost, no catch.',
        cta: null,
      },
      {
        icon: '📋',
        tag: 'PDF Guide',
        tagColor: 'blue',
        title: 'Digital Guides',
        description: 'Step-by-step PDF guide to getting into a summer program — with essay templates, checklists, and a timeline that actually works.',
        price: 'from $20',
        cta: 'Get the Guide',
      },
      {
        icon: '💬',
        tag: 'Personal',
        tagColor: 'purple',
        title: '1-on-1 Consulting',
        description: '60 minutes, just us. We\'ll review your profile, pick the right programs, and work through your essays together.',
        price: 'from $50 / session',
        cta: 'Book a Session',
      },
    ],

    // Pricing
    pricingLabel: 'Packages',
    pricingTitle: 'Choose your level of support',
    packages: [
      {
        name: 'Quick Consult',
        price: '$50',
        period: '/ one session',
        popular: false,
        color: 'blue',
        features: [
          '1 × 60-minute Zoom session',
          'Profile review',
          'Program recommendations',
          'Q&A on anything',
        ],
        cta: 'Book',
      },
      {
        name: 'Full Package',
        price: '$150',
        period: '/ 3 sessions',
        popular: true,
        popularLabel: 'Most Popular',
        color: 'purple',
        features: [
          '3 × 60-minute Zoom sessions',
          'Program selection strategy',
          'Essay writing & review',
          'Document review',
          'Full application support',
        ],
        cta: 'Book',
      },
      {
        name: 'Premium',
        price: '$300',
        period: '/ 5 sessions',
        popular: false,
        color: 'teal',
        features: [
          '5 × 60-minute Zoom sessions',
          'Everything in Full Package',
          'Multi-program strategy',
          'Interview preparation',
          'Private Telegram community',
        ],
        cta: 'Book',
      },
    ],

    // About
    aboutLabel: 'Who I am',
    aboutName: 'Dinay',
    aboutRole: 'Harvard Summer School 2026 · Houston, TX',
    aboutBio: "I'm a 10th grader from Houston, TX — and I got into Harvard Summer School to study Neuroscience & Biology. I know how confusing and stressful the application process can be, especially when you're doing it alone. I built this to share everything I've learned, so you don't have to figure it out from scratch.",
    aboutTikTok: 'TikTok',
    aboutTelegram: 'Telegram',

    // FAQ
    faqLabel: 'FAQ',
    faqTitle: 'Common questions',
    faqs: [
      {
        q: 'What summer programs do you recommend?',
        a: 'It depends on your goals, grades, and interests. For STEM-focused students, programs like RSI, SSP, and MIT PRIMES are exceptional. For a broader academic experience, Yale Young Global Scholars is a great fit. During a consultation, I help you build a list that matches your specific profile.',
      },
      {
        q: 'How early should I start applying?',
        a: 'Most top programs have deadlines between December and February for summer sessions. I recommend starting research in September and having your materials ready by November. Starting early gives you time to write strong essays — the biggest factor in admissions.',
      },
      {
        q: 'What does a consultation include?',
        a: 'We meet on Zoom for 60 minutes. I review your academic profile, help you identify the best-fit programs, and give you actionable feedback on your essays or application strategy. You leave with a clear plan.',
      },
      {
        q: 'Do you help with scholarship applications?',
        a: 'Yes — many top programs are free or offer need-based aid. I\'ll help you identify which programs have strong scholarship support and how to make your financial aid application as strong as possible.',
      },
      {
        q: 'What languages do you consult in?',
        a: 'English and Russian. I work with students from Central Asia, Russia, and the US — feel free to reach out in whichever language you\'re more comfortable with.',
      },
    ],

    // Final CTA
    ctaTitle: 'Ready to find your perfect summer program?',
    ctaSubtitle: 'Let\'s figure it out together.',
    ctaBook: 'Book a Free Intro Call',
    ctaGuide: 'Get the Guide',
  },

  ru: {
    // Hero
    badge: 'Летние программы',
    title: 'Твой гид по лучшим',
    titleAccent: 'летним программам',
    subtitle: 'Найди подходящую программу, сильно подай заявку и поступи. Этот гид создан человеком, который сам прошёл через это — Harvard Summer School 2026.',
    harvardBadge: '🎓 Harvard Summer School 2026',
    harvardSub: 'Нейронауки и биология',

    // Services
    servicesLabel: 'Что я предлагаю',
    servicesTitle: 'От выбора программы до поступления',
    services: [
      {
        icon: '📖',
        tag: 'Бесплатно',
        tagColor: 'green',
        title: 'Бесплатные ресурсы',
        description: 'Статьи и гайды о том, как выбрать программу, на что обращать внимание и когда подавать заявки. Бесплатно и без условий.',
        cta: null,
      },
      {
        icon: '📋',
        tag: 'PDF гайд',
        tagColor: 'blue',
        title: 'Цифровые гайды',
        description: 'Пошаговый PDF-гайд по поступлению в летнюю школу — с шаблонами эссе, чек-листами и таймлайном, который реально работает.',
        price: 'от $20',
        cta: 'Получить гайд',
      },
      {
        icon: '💬',
        tag: 'Личное',
        tagColor: 'purple',
        title: 'Персональная консультация',
        description: '60 минут один на один. Разберём твой профиль, выберем программы, поработаем над эссе — вместе.',
        price: 'от $50 / сессия',
        cta: 'Записаться',
      },
    ],

    // Pricing
    pricingLabel: 'Пакеты',
    pricingTitle: 'Выбери уровень поддержки',
    packages: [
      {
        name: 'Быстрая консультация',
        price: '$50',
        period: '/ одна сессия',
        popular: false,
        color: 'blue',
        features: [
          '1 × 60 минут в Zoom',
          'Разбор профиля',
          'Рекомендации по программам',
          'Ответы на любые вопросы',
        ],
        cta: 'Записаться',
      },
      {
        name: 'Полный пакет',
        price: '$150',
        period: '/ 3 сессии',
        popular: true,
        popularLabel: 'Популярный',
        color: 'purple',
        features: [
          '3 × 60 минут в Zoom',
          'Стратегия выбора программ',
          'Написание и правка эссе',
          'Ревью документов',
          'Полное сопровождение заявки',
        ],
        cta: 'Записаться',
      },
      {
        name: 'Премиум',
        price: '$300',
        period: '/ 5 сессий',
        popular: false,
        color: 'teal',
        features: [
          '5 × 60 минут в Zoom',
          'Всё из полного пакета',
          'Стратегия для нескольких программ',
          'Подготовка к интервью',
          'Закрытое Telegram-сообщество',
        ],
        cta: 'Записаться',
      },
    ],

    // About
    aboutLabel: 'Кто я',
    aboutName: 'Динай',
    aboutRole: 'Harvard Summer School 2026 · Хьюстон, Техас',
    aboutBio: 'Я старшеклассница из Хьюстона — и поступила в Harvard Summer School на программу по нейронаукам и биологии. Я знаю, насколько запутанным и стрессовым может быть процесс подачи заявки, особенно когда делаешь это самостоятельно. Я создала этот ресурс, чтобы поделиться всем, что узнала — чтобы тебе не пришлось разбираться с нуля.',
    aboutTikTok: 'TikTok',
    aboutTelegram: 'Telegram',

    // FAQ
    faqLabel: 'FAQ',
    faqTitle: 'Частые вопросы',
    faqs: [
      {
        q: 'Какие летние программы ты рекомендуешь?',
        a: 'Это зависит от твоих целей, оценок и интересов. Для студентов, ориентированных на точные науки, отлично подойдут RSI, SSP и MIT PRIMES. Для более широкого академического опыта — Yale Young Global Scholars. На консультации я помогу составить список программ, который подходит именно тебе.',
      },
      {
        q: 'Когда начинать подавать заявки?',
        a: 'Большинство топовых программ принимают заявки с декабря по февраль на летние сессии. Я рекомендую начинать исследование в сентябре и готовить материалы к ноябрю. Чем раньше начнёшь — тем больше времени на сильные эссе, которые решают многое.',
      },
      {
        q: 'Что включает консультация?',
        a: 'Мы встречаемся в Zoom на 60 минут. Я изучаю твой академический профиль, помогаю выбрать подходящие программы и даю конкретную обратную связь по эссе или стратегии заявки. Ты уходишь с чётким планом.',
      },
      {
        q: 'Помогаешь ли ты с заявками на стипендии?',
        a: 'Да — многие топовые программы бесплатны или предоставляют стипендии. Я помогу найти программы с хорошей финансовой поддержкой и сделать твою заявку на стипендию как можно сильнее.',
      },
      {
        q: 'На каких языках проводишь консультации?',
        a: 'На английском и русском. Я работаю со студентами из Центральной Азии, России и США — пишите на том языке, на котором удобнее.',
      },
    ],

    // Final CTA
    ctaTitle: 'Готов найти свою идеальную летнюю программу?',
    ctaSubtitle: 'Давай разберёмся вместе.',
    ctaBook: 'Записаться на бесплатный звонок',
    ctaGuide: 'Получить гайд',
  },
};

const tagColors = {
  green:  { bg: 'var(--green-soft)',   color: 'var(--green)' },
  blue:   { bg: 'var(--blue-glow)',    color: 'var(--blue)' },
  purple: { bg: 'var(--purple-soft)',  color: 'var(--purple)' },
};

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'faq-item--open' : ''}`}>
      <button className="faq-item__q" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <span className="faq-item__icon">{open ? '−' : '+'}</span>
      </button>
      <div className="faq-item__body">
        <p className="faq-item__a">{a}</p>
      </div>
    </div>
  );
}

function SummerPrograms({ language }) {
  const t = text[language];

  const handleStub = (label) => {
    alert(`${label} — coming soon! We'll connect this to the booking/payment system shortly.`);
  };

  return (
    <div className="programs-page">

      {/* ── Section 1: Hero ── */}
      <section className="sp-hero">
        <div className="sp-hero__inner">
          <div className="sp-hero__text">
            <span className="hero__badge">{t.badge}</span>
            <h1 className="sp-hero__title">
              {t.title}
              <br />
              <span className="hero__title-accent">{t.titleAccent}</span>
            </h1>
            <p className="sp-hero__subtitle">{t.subtitle}</p>
          </div>
          <div className="sp-hero__proof">
            {/* Place your photo at public/images/hero-photo.jpg */}
            <img
              src="/images/hero-photo.jpg"
              alt="Harvard Summer School 2026"
              className="sp-hero-photo"
            />
            <div className="sp-proof-badge">
              <div className="sp-proof-badge__icon">🎓</div>
              <div>
                <div className="sp-proof-badge__title">Harvard Summer School 2026</div>
                <div className="sp-proof-badge__sub">{t.harvardSub}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Services ── */}
      <section className="sp-section sp-services">
        <div className="sp-inner">
          <span className="section-label">{t.servicesLabel}</span>
          <h2 className="section-title">{t.servicesTitle}</h2>
          <div className="sp-services__grid">
            {t.services.map((s, i) => {
              const tc = tagColors[s.tagColor];
              return (
                <div key={i} className="sp-service-card">
                  <div className="sp-service-card__top">
                    <span className="sp-service-card__icon">{s.icon}</span>
                    <span
                      className="sp-service-card__tag"
                      style={{ background: tc.bg, color: tc.color }}
                    >
                      {s.tag}
                    </span>
                  </div>
                  <h3 className="sp-service-card__title">{s.title}</h3>
                  <p className="sp-service-card__desc">{s.description}</p>
                  {(s.price || s.cta) && (
                    <div className="sp-service-card__footer">
                      {s.price && <span className="sp-service-card__price">{s.price}</span>}
                      {s.cta && (
                        <button
                          className="btn btn--primary sp-service-card__btn"
                          onClick={() => handleStub(s.cta)}
                        >
                          {s.cta}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 3: Pricing ── */}
      <section className="sp-section sp-pricing">
        <div className="sp-inner">
          <span className="section-label">{t.pricingLabel}</span>
          <h2 className="section-title">{t.pricingTitle}</h2>
          <div className="sp-pricing__grid">
            {t.packages.map((pkg, i) => (
              <div
                key={i}
                className={`sp-pkg sp-pkg--${pkg.color} ${pkg.popular ? 'sp-pkg--popular' : ''}`}
              >
                {pkg.popular && (
                  <div className="sp-pkg__popular-label">{pkg.popularLabel}</div>
                )}
                <div className="sp-pkg__header">
                  <h3 className="sp-pkg__name">{pkg.name}</h3>
                  <div className="sp-pkg__price">
                    <span className="sp-pkg__amount">{pkg.price}</span>
                    <span className="sp-pkg__period">{pkg.period}</span>
                  </div>
                </div>
                <ul className="sp-pkg__features">
                  {pkg.features.map((f, j) => (
                    <li key={j} className="sp-pkg__feature">
                      <span className="sp-pkg__check">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`btn sp-pkg__btn ${pkg.popular ? 'btn--primary' : 'btn--secondary'}`}
                  onClick={() => handleStub(pkg.cta)}
                >
                  {pkg.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: About ── */}
      <section className="sp-section sp-about">
        <div className="sp-inner">
          <span className="section-label">{t.aboutLabel}</span>
          <div className="sp-about__card">
            <div className="sp-about__content">
              <h3 className="sp-about__name">{t.aboutName}</h3>
              <p className="sp-about__role">{t.aboutRole}</p>
              <p className="sp-about__bio">{t.aboutBio}</p>
              <div className="sp-about__links">
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sp-about__link sp-about__link--tiktok"
                >
                  <span>♪</span> {t.aboutTikTok}
                </a>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sp-about__link sp-about__link--telegram"
                >
                  <span>✈</span> {t.aboutTelegram}
                </a>
              </div>
            </div>
            {/* Place your photo at public/images/about-photo.jpg */}
            <div className="sp-about__photo-wrap">
              <img
                src="/images/about-photo.jpg"
                alt={t.aboutName}
                className="sp-about__photo"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: FAQ ── */}
      <section className="sp-section sp-faq">
        <div className="sp-inner sp-inner--narrow">
          <span className="section-label">{t.faqLabel}</span>
          <h2 className="section-title">{t.faqTitle}</h2>
          <div className="faq-list">
            {t.faqs.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: Final CTA ── */}
      <section className="sp-cta">
        <div className="sp-cta__inner">
          <div className="cta-section__glow"></div>
          <h2 className="sp-cta__title">{t.ctaTitle}</h2>
          <p className="sp-cta__subtitle">{t.ctaSubtitle}</p>
          <div className="sp-cta__buttons">
            <button
              className="btn btn--white"
              onClick={() => handleStub(t.ctaBook)}
            >
              {t.ctaBook}
              <span className="btn__arrow">→</span>
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => handleStub(t.ctaGuide)}
            >
              {t.ctaGuide}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default SummerPrograms;
