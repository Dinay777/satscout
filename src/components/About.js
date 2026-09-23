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
    story: "September, 2025. After a long study session, I was sitting in front of my iPad staring at 10 open tabs: Khan Academy, College Board, ChatGPT, and a TikTok comment section. \"I scored a 1500 just by learning Desmos tricks and doing practice questions for 3 hours every day,\" I read with zero motivation to continue. How was I supposed to do that?\n\nThe internet is overflowing with SAT resources — tutors charging $100 an hour, useless courses, constant ads, and a million strangers on Tiktok contradicting each other. I had no idea what to do next. So I did what most students do: I burnt out completely and didn't touch a single SAT prep tool for six months.\n\nThen I built my own.\n\nI got a 1280 on my first try. Over the next few months I tested basically everything, threw out the noise, and kept what actually moved my score — and got it to a 1410. SATScout is that whole process turned into something you can just use. You tell it where you're at and when your test is; it finds your weak spots, builds a plan around your real schedule, and tells you what to do next. That's it.\n\nIf you're staring at ten open tabs right now with no idea where to start — yeah, I built this for you.",
    missionLabel: 'Why I keep building it',
    missionTitle: "Nobody should have to piece this together alone the way I did. That's the whole point.",
    valuesLabel: 'A few things I actually believe',
    values: [
      {
        iconKey: 'target',
        title: 'A short list, not a firehose',
        description: "I'd rather hand you 29 things that work than bury you in 200. Everything in the library earned its spot — I've used most of it myself.",
      },
      {
        iconKey: 'globe',
        title: 'Free, and staying free',
        description: 'Where you live shouldn\'t decide your score. A student in Bishkek should get the same prep as one in New York — so none of this costs anything.',
      },
      {
        iconKey: 'shield',
        title: 'Nobody pays me to say this',
        description: 'No affiliate links, no sponsorships. If a resource is here, it\'s because it helped — full stop.',
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
    story: 'Сентябрь, 2025. После долгой учёбы я сидела перед айпадом и смотрела на 10 открытых вкладок: Khan Academy, College Board, ChatGPT и комментарии в TikTok. «Я набрала 1500, просто выучив трюки в Desmos и решая задачи по 3 часа в день» — читала я без капли мотивации продолжать. Как мне это вообще делать?\n\nИнтернет переполнен SAT-ресурсами — репетиторы по 100$ в час, бесполезные курсы, бесконечная реклама и миллион незнакомцев в TikTok, которые противоречат друг другу. Я понятия не имела, что делать дальше. Поэтому я сделала то, что делает большинство студентов: полностью выгорела и не притрагивалась ни к одному инструменту для подготовки к SAT шесть месяцев.\n\nА потом создала свой.\n\nС первой попытки я набрала 1280. За следующие пару месяцев я перепробовала почти всё, выкинула шум и оставила то, что реально двигало балл, — и подняла его до 1410. SATScout — это весь тот путь, собранный в одном месте, которым можно просто пользоваться. Ты говоришь, где ты сейчас и когда экзамен; он находит слабые места, строит план под твоё реальное расписание и говорит, что делать дальше. Вот и всё.\n\nЕсли ты прямо сейчас смотришь на десять открытых вкладок и не знаешь, с чего начать, — да, я сделала это для тебя.',
    missionLabel: 'Зачем я это делаю',
    missionTitle: 'Никто не должен разбираться со всем этим в одиночку, как пришлось мне. В этом весь смысл.',
    valuesLabel: 'Во что я правда верю',
    values: [
      {
        iconKey: 'target',
        title: 'Короткий список, а не свалка',
        description: 'Лучше дам тебе 29 вещей, которые работают, чем завалю двумя сотнями. Всё в библиотеке заслужило место — большую часть я использовала сама.',
      },
      {
        iconKey: 'globe',
        title: 'Бесплатно — и останется бесплатным',
        description: 'Твой город не должен решать твой балл. Студент в Бишкеке заслуживает той же подготовки, что и студент в Нью-Йорке, — поэтому это ничего не стоит.',
      },
      {
        iconKey: 'shield',
        title: 'Мне за это никто не платит',
        description: 'Никаких партнёрских ссылок и спонсоров. Если ресурс здесь — значит, он реально помог. Точка.',
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
