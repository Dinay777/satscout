import React from 'react';

const text = {
  en: {
    label: 'Real results',
    title: 'Students who prepped smarter',
    subtitle: 'From Central Asia to the US — structured, focused prep with the right resources makes the difference.',
    students: [
      {
        initials: 'AN',
        name: 'Asel N.',
        location: 'Almaty, Kazakhstan',
        color: 'blue',
        from: 1080,
        to: 1390,
        quote: 'I had no idea where to start. SATScout gave me a clear weekly plan and the AI buddy helped me work through every concept I was stuck on.',
      },
      {
        initials: 'DS',
        name: 'Dmitri S.',
        location: 'Moscow, Russia',
        color: 'teal',
        from: 1150,
        to: 1480,
        quote: 'The resource library saved me weeks of research. I went from 1150 to 1480 in 3 months using exactly the books and tools recommended here.',
      },
      {
        initials: 'MK',
        name: 'Maya K.',
        location: 'Houston, TX',
        color: 'purple',
        from: 1200,
        to: 1560,
        quote: 'A bilingual AI tutor was a game changer. Being able to ask questions in Russian when English explanations weren\'t clicking made a huge difference.',
      },
    ],
  },
  ru: {
    label: 'Реальные результаты',
    title: 'Студенты, которые подготовились умнее',
    subtitle: 'От Центральной Азии до США — структурированная подготовка с правильными ресурсами меняет всё.',
    students: [
      {
        initials: 'АН',
        name: 'Асель Н.',
        location: 'Алматы, Казахстан',
        color: 'blue',
        from: 1080,
        to: 1390,
        quote: 'Я не знала с чего начать. SATScout дал чёткий план по неделям, а AI помощник помог разобраться со всеми темами, на которых я застревала.',
      },
      {
        initials: 'ДС',
        name: 'Дмитрий С.',
        location: 'Москва, Россия',
        color: 'teal',
        from: 1150,
        to: 1480,
        quote: 'Библиотека ресурсов сэкономила недели исследований. За 3 месяца вырос с 1150 до 1480, используя именно те книги, которые рекомендует сайт.',
      },
      {
        initials: 'МК',
        name: 'Майя К.',
        location: 'Хьюстон, США',
        color: 'purple',
        from: 1200,
        to: 1560,
        quote: 'Двуязычный AI репетитор — это было решающим. Возможность задавать вопросы на русском, когда английские объяснения не заходили, очень помогла.',
      },
    ],
  },
};

function SocialProof({ language }) {
  const t = text[language];

  return (
    <section className="social-proof">
      <div className="social-proof__inner">
        <span className="section-label">{t.label}</span>
        <h2 className="section-title">{t.title}</h2>
        <p className="section-subtitle">{t.subtitle}</p>

        <div className="testimonials">
          {t.students.map((s, i) => (
            <div className={`testimonial testimonial--${s.color}`} key={i}>
              <div className="testimonial__top">
                <div className={`testimonial__avatar testimonial__avatar--${s.color}`}>
                  {s.initials}
                </div>
                <div className="testimonial__info">
                  <span className="testimonial__name">{s.name}</span>
                  <span className="testimonial__location">{s.location}</span>
                </div>
                <div className="testimonial__score-badge">
                  <span className="testimonial__score-from">{s.from}</span>
                  <span className="testimonial__score-arrow">→</span>
                  <span className="testimonial__score-to">{s.to}</span>
                </div>
              </div>
              <p className="testimonial__quote">"{s.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SocialProof;
