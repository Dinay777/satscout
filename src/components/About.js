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
    story: "September 2025. After a long study session I was sitting in front of my iPad, staring at 10 open tabs: Khan Academy, College Board, ChatGPT, and a TikTok comment section. \"I scored a 1500 just by learning Desmos tricks and doing practice questions for 3 hours a day,\" one of them said. I had zero motivation to keep reading. How was I even supposed to do that?\n\nThe internet is drowning in SAT resources. Tutors charging $100 an hour, useless courses, ads everywhere, and a million strangers on TikTok all saying the opposite of each other. I had no idea what to actually do next, so I did what a lot of students do. I burnt out and didn't touch a single SAT tool for six months.\n\nThen I built my own.\n\nI got a 1280 on my first try. Over the next few months I tried almost everything, ignored the noise, and kept the stuff that actually moved my score. It went up to 1410. SATScout is that whole process, just made into something you can use. You tell it where you're at and when your test is. It finds your weak spots, builds a plan around your real schedule, and tells you what to do next.\n\nIf you're sitting there with ten tabs open right now and no clue where to start, yeah, I made this for you.",
    missionLabel: 'Why I keep building it',
    missionTitle: 'Nobody should have to figure all this out alone the way I did.',
    valuesLabel: 'A few things I actually believe',
    values: [
      {
        iconKey: 'target',
        title: 'Fewer resources, better ones',
        description: "I'd rather give you 29 things that work than bury you in 200. Everything in the library is there for a reason, and I've used most of it myself.",
      },
      {
        iconKey: 'globe',
        title: 'Free, and staying free',
        description: 'Where you live shouldn\'t decide your score. A student in Bishkek should get the same prep as one in New York, so none of this costs anything.',
      },
      {
        iconKey: 'shield',
        title: 'Nobody pays me to say this',
        description: 'No affiliate links, no sponsorships. If a resource is here, it\'s because it helped me.',
      },
    ],
    contactLabel: 'Get in touch',
    contactTitle: 'Questions or suggestions?',
    contactSubtitle: 'Reach out directly. I read every message.',
    contactEmail: 'Email us',
    contactEmailAddr: 'dinaytaalaibekova@gmail.com',
    builtWith: 'Built with ♥ by Dinay.',
  },
  ru: {
    badge: 'Наша история',
    title: 'Не было репетитора —',
    titleAccent: 'пришлось создать.',
    story: 'Сентябрь 2025. После долгой учёбы я сидела перед айпадом и смотрела на 10 открытых вкладок: Khan Academy, College Board, ChatGPT и комментарии в TikTok. «Я набрала 1500, просто выучив трюки в Desmos и решая задачи по 3 часа в день», — прочитала я без всякого желания читать дальше. Как мне вообще это повторить?\n\nВ интернете тонны материалов по SAT. Репетиторы по 100$ в час, бесполезные курсы, реклама на каждом шагу и миллион незнакомцев в TikTok, которые говорят прямо противоположное. Я не понимала, что делать дальше, и сделала то же, что и большинство: полностью выгорела и полгода не открывала ни одного инструмента для подготовки.\n\nА потом сделала свой.\n\nС первой попытки я набрала 1280. За следующие месяцы я перепробовала почти всё, отбросила лишнее и оставила то, что реально поднимало балл. В итоге дошла до 1410. SATScout — это весь этот путь, собранный в одном месте, которым можно просто пользоваться. Ты говоришь, где ты сейчас и когда экзамен. Он находит слабые места, строит план под твоё расписание и подсказывает, что делать дальше.\n\nЕсли ты прямо сейчас сидишь с десятью открытыми вкладками и не знаешь, с чего начать, — да, я сделала это для тебя.',
    missionLabel: 'Зачем я это делаю',
    missionTitle: 'Никто не должен разбираться со всем этим в одиночку, как пришлось мне.',
    valuesLabel: 'Во что я правда верю',
    values: [
      {
        iconKey: 'target',
        title: 'Меньше, но лучше',
        description: 'Лучше дам тебе 29 вещей, которые работают, чем завалю двумя сотнями. Всё в библиотеке попало туда не просто так, и большую часть я использовала сама.',
      },
      {
        iconKey: 'globe',
        title: 'Бесплатно и останется бесплатным',
        description: 'Твой город не должен решать твой балл. Студент в Бишкеке заслуживает той же подготовки, что и студент в Нью-Йорке, поэтому это ничего не стоит.',
      },
      {
        iconKey: 'shield',
        title: 'Мне за это никто не платит',
        description: 'Никаких партнёрских ссылок и спонсоров. Если ресурс здесь, значит, он реально мне помог.',
      },
    ],
    contactLabel: 'Связаться',
    contactTitle: 'Есть вопросы или предложения?',
    contactSubtitle: 'Напиши напрямую, я читаю каждое сообщение.',
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
