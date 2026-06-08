import React from 'react';

const text = {
  en: {
    badge: 'Our Story',
    title: "Didn't have a tutor,",
    titleAccent: 'so I built one.',
    story: "I remember the exact moment I knew SAT prep was broken. I was sitting at my desk, fifteen tabs open, every 'ultimate guide' saying something different. Which books? In what order? How many practice tests? I was losing weeks just figuring out where to start — and the clock was ticking.\n\nSo I built SATScout. Every resource in the library has been tested, not just listed. The AI Buddy is the tutor I wish I'd had: patient, bilingual, no judgment, and available at 2am when you're stuck and panicking.\n\nNo ads. No affiliate links. No upsells. If SATScout helped you, all I ask is that you tell someone who needs it.",
    missionLabel: 'Mission',
    missionTitle: 'Make world-class SAT prep accessible to every student — regardless of location or income.',
    valuesLabel: 'What we believe',
    values: [
      {
        icon: '🎯',
        title: 'Quality over quantity',
        description: '25 excellent resources beat 200 mediocre ones every time. Every resource in our library was chosen because it genuinely works.',
      },
      {
        icon: '🌍',
        title: 'Accessibility first',
        description: 'Students in Almaty, Tashkent, or Bishkek deserve the same prep quality as students in New York. That\'s why SATScout is free and accessible to anyone.',
      },
      {
        icon: '🤝',
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
    story: 'Я точно помню тот момент, когда поняла, что подготовка к SAT — это хаос. Сидела за столом, пятнадцать вкладок открыто, и каждый «лучший гайд» говорил что-то своё. Какие книги? В каком порядке? Сколько практических тестов? Я теряла недели, просто пытаясь понять с чего начать — а время шло.\n\nПоэтому я создала SATScout. Каждый ресурс в библиотеке проверен лично — не просто добавлен. AI помощник — это репетитор, которого я хотела: терпеливый, двуязычный, без осуждения и доступный в 2 ночи, когда застряла и паникуешь.\n\nНикакой рекламы. Никаких реферальных ссылок. Никаких платных функций. Если SATScout тебе помог — расскажи тому, кому это нужно.',
    missionLabel: 'Миссия',
    missionTitle: 'Сделать качественную подготовку к SAT доступной для каждого студента — вне зависимости от места и дохода.',
    valuesLabel: 'Во что мы верим',
    values: [
      {
        icon: '🎯',
        title: 'Качество важнее количества',
        description: '25 отличных ресурсов всегда лучше 200 посредственных. Каждый ресурс в библиотеке выбран потому, что он реально работает.',
      },
      {
        icon: '🌍',
        title: 'Доступность прежде всего',
        description: 'Студенты в Алматы, Ташкенте или Бишкеке заслуживают той же качественной подготовки, что и студенты в Нью-Йорке. Поэтому SATScout бесплатный и доступен каждому.',
      },
      {
        icon: '🤝',
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
                <span className="about-value-card__icon">{v.icon}</span>
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
