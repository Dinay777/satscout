import React from 'react';

const VALUE_ICONS = {
  target: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  globe: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  shield: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
};

const text = {
  en: {
    badge: 'Our Story',
    title: "Didn't have a tutor,",
    titleAccent: 'so I built one.',
    story: "September, 2025. After a long study session, I was sitting in front of my iPad staring at 10 open tabs: Khan Academy, College Board, ChatGPT, and a TikTok comment section. \"I scored a 1500 just by learning Desmos tricks and doing practice questions for 3 hours every day,\" I read with zero motivation to continue. How was I supposed to do that?\n\nThe internet is overflowing with SAT resources — tutors charging $100 an hour, useless courses, constant ads, and a million strangers on Tiktok contradicting each other. I had no idea what to do next. So I did what most students do: I burnt out completely and didn't touch a single SAT prep tool for six months.\n\nThen I built my own.\n\nI got a 1280 on my first attempt. After months of testing resources, figuring out what actually works and what's just noise, I brought it up to a 1410. SATScout is everything I wish I had when I started. It is not another AI-powered study tool, but a personalized mentor that knows SAT prep inside out. It finds your weak spots, builds a plan around your schedule and goals, and tells you exactly what to study next. No guessing, no overwhelm, no $100/hour tutors.\n\nIf you're stuck and don't know where to start — this was made for you.",
    missionLabel: 'Mission',
    missionTitle: 'To cut through the noise and give every student a clear path to their goal score.',
    valuesLabel: 'What we believe',
    values: [
      {
        iconKey: 'target',
        title: 'Quality over quantity',
        description: '25 excellent resources beat 200 mediocre ones every time. Every resource in our library was chosen because it genuinely works.',
      },
      {
        iconKey: 'globe',
        title: 'Accessibility first',
        description: 'Students in Almaty, Tashkent, or Bishkek deserve the same prep quality as students in New York. That\'s why SATScout is free and accessible to anyone.',
      },
      {
        iconKey: 'shield',
        title: 'Honest guidance',
        description: 'No affiliate links, no sponsored recommendations. If something is here, it\'s because it earned its place.',
      },
    ],
    contactLabel: 'Get in touch',
    contactTitle: 'Questions or suggestions?',
    contactSubtitle: 'Reach out directly — I read every message.',
    contactEmail: 'Email us',
    contactEmailAddr: 'dinaytaalaibekova@gmail.com',
    builtWith: 'Built with ♥ by Dinay.',
  },
  ru: {
    badge: 'Наша история',
    title: 'Не было репетитора —',
    titleAccent: 'пришлось создать.',
    story: 'Сентябрь, 2025. После долгой учёбы я сидела перед айпадом и смотрела на 10 открытых вкладок: Khan Academy, College Board, ChatGPT и комментарии в TikTok. «Я набрала 1500, просто выучив трюки в Desmos и решая задачи по 3 часа в день» — читала я без капли мотивации продолжать. Как мне это вообще делать?\n\nИнтернет переполнен SAT-ресурсами — репетиторы по 100$ в час, бесполезные курсы, бесконечная реклама и миллион незнакомцев в TikTok, которые противоречат друг другу. Я понятия не имела, что делать дальше. Поэтому я сделала то, что делает большинство студентов: полностью выгорела и не притрагивалась ни к одному инструменту для подготовки к SAT шесть месяцев.\n\nА потом создала свой.\n\nС первой попытки я набрала 1280. После месяцев тестирования ресурсов, разбора того, что реально работает, а что просто шум, — я подняла результат до 1410. SATScout — это всё, что я хотела иметь с самого начала. Не очередной AI-инструмент, а персональный наставник, который знает подготовку к SAT изнутри. Он находит твои слабые места, строит план под твоё расписание и цели, и говорит точно, что учить дальше. Без угадывания, без перегрузки, без репетиторов по 100$ в час.\n\nЕсли ты застрял и не знаешь, с чего начать — это сделано для тебя.',
    missionLabel: 'Миссия',
    missionTitle: 'Убрать шум и дать каждому студенту чёткий путь к целевому баллу.',
    valuesLabel: 'Во что мы верим',
    values: [
      {
        iconKey: 'target',
        title: 'Качество важнее количества',
        description: '25 отличных ресурсов всегда лучше 200 посредственных. Каждый ресурс в библиотеке выбран потому, что он реально работает.',
      },
      {
        iconKey: 'globe',
        title: 'Доступность прежде всего',
        description: 'Студенты в Алматы, Ташкенте или Бишкеке заслуживают той же качественной подготовки, что и студенты в Нью-Йорке. Поэтому SATScout бесплатный и доступен каждому.',
      },
      {
        iconKey: 'shield',
        title: 'Честные рекомендации',
        description: 'Никаких партнёрских ссылок, никаких спонсированных рекомендаций. Если что-то есть на платформе — значит, оно это заслужило.',
      },
    ],
    contactLabel: 'Связаться',
    contactTitle: 'Есть вопросы или предложения?',
    contactSubtitle: 'Напиши напрямую — я читаю каждое сообщение.',
    contactEmail: 'Написать нам',
    contactEmailAddr: 'dinaytaalaibekova@gmail.com',
    builtWith: 'Built with ♥ by Dinay.',
  },
};

function About({ language }) {
  const t = text[language];

  return (
    <div className="about-page">

      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero__inner">
          <span className="hero__badge">{t.badge}</span>
          <h1 className="about-hero__title">
            {t.title}
            <br />
            <span className="hero__title-accent">{t.titleAccent}</span>
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="about-story">
        <div className="about-story__inner">
          <div className="about-story__text">
            {t.story.split('\n\n').map((para, i) => (
              <p key={i} className="about-story__para">{para}</p>
            ))}
          </div>

          <div className="about-story__aside">
            {/* Your photo — add it to /public/images/about-photo.jpg */}
            <div className="about-photo-frame">
              <img
                src="/images/about-photo.jpg"
                alt="Dinay"
                className="about-photo"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>

            <div className="about-mission-box">
              <span className="section-label">{t.missionLabel}</span>
              <p className="about-mission-box__text">{t.missionTitle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="about-values__inner">
          <span className="section-label">{t.valuesLabel}</span>
          <div className="about-values__grid">
            {t.values.map((v, i) => (
              <div key={i} className="about-value-card">
                <div className="about-value-card__icon-wrap">
                  {VALUE_ICONS[v.iconKey]}
                </div>
                <h3 className="about-value-card__title">{v.title}</h3>
                <p className="about-value-card__description">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="about-contact">
        <div className="about-contact__inner">
          <span className="section-label">{t.contactLabel}</span>
          <h2 className="about-contact__title">{t.contactTitle}</h2>
          <p className="about-contact__subtitle">{t.contactSubtitle}</p>
          <a href={`mailto:${t.contactEmailAddr}`} className="btn btn--primary">
            {t.contactEmail}
            <span className="btn__arrow">→</span>
          </a>
          <p className="about-contact__built">{t.builtWith}</p>
        </div>
      </section>

    </div>
  );
}

export default About;
