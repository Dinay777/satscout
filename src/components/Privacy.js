import React from 'react';

const text = {
  en: {
    badge: 'Privacy',
    title: 'Privacy Policy',
    updated: 'Last updated: September 2026',
    sections: [
      ['What we collect', 'When you create an account we store your email address and the study details you enter during onboarding (target score, current score, exam timeframe, weak areas, weekly study hours). We also store the study tasks and progress you generate while using SATScout.'],
      ['How we use it', 'We use this information only to build your personalized study plan, show your progress, and improve the product. We never sell your data, and we do not run advertising.'],
      ['Analytics', 'We use privacy-friendly product analytics to understand how features are used (for example, how many people finish onboarding or generate a plan). We do not record your screen and do not collect the content of your messages for analytics.'],
      ['AI conversations', 'Messages you send to the AI Study Buddy are processed by our AI provider to generate replies and are stored so you can see your chat history. Do not share sensitive personal information in the chat.'],
      ['Data storage', 'Your data is stored securely with our infrastructure providers (Supabase for accounts and data). Access is protected by authentication.'],
      ['Students under 18', 'SATScout is used by high-school students. If you are under 18, please use the platform with the awareness of a parent or guardian. We collect only what is needed to provide the service.'],
      ['Your choices', 'You can request deletion of your account and associated data at any time by emailing us.'],
      ['Contact', 'Questions about privacy? Email dinaytaalaibekova@gmail.com.'],
    ],
  },
  ru: {
    badge: 'Конфиденциальность',
    title: 'Политика конфиденциальности',
    updated: 'Обновлено: сентябрь 2026',
    sections: [
      ['Какие данные мы собираем', 'При создании аккаунта мы сохраняем твой email и данные подготовки, которые ты вводишь при онбординге (целевой балл, текущий балл, срок до экзамена, слабые темы, часы занятий в неделю). Также мы храним задачи и прогресс, которые ты создаёшь в SATScout.'],
      ['Как мы это используем', 'Мы используем эти данные только чтобы построить твой персональный план, показать прогресс и улучшать продукт. Мы никогда не продаём твои данные и не показываем рекламу.'],
      ['Аналитика', 'Мы используем аналитику, дружелюбную к приватности, чтобы понять, как используются функции (например, сколько людей завершают онбординг или создают план). Мы не записываем экран и не собираем содержание твоих сообщений для аналитики.'],
      ['Общение с AI', 'Сообщения, которые ты отправляешь AI-помощнику, обрабатываются нашим AI-провайдером для генерации ответов и сохраняются, чтобы ты видел историю чата. Не делись чувствительной личной информацией в чате.'],
      ['Хранение данных', 'Твои данные надёжно хранятся у наших инфраструктурных провайдеров (Supabase для аккаунтов и данных). Доступ защищён аутентификацией.'],
      ['Ученики младше 18', 'SATScout используют школьники. Если тебе меньше 18, пользуйся платформой с ведома родителя или опекуна. Мы собираем только то, что нужно для работы сервиса.'],
      ['Твой выбор', 'Ты можешь в любой момент запросить удаление аккаунта и связанных данных, написав нам.'],
      ['Контакты', 'Вопросы о конфиденциальности? Пиши на dinaytaalaibekova@gmail.com.'],
    ],
  },
};

function Privacy({ language }) {
  const t = text[language] || text.en;

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero__inner">
          <span className="hero__badge">{t.badge}</span>
          <h1 className="about-hero__title">{t.title}</h1>
          <p className="about-story__para" style={{ opacity: 0.7 }}>{t.updated}</p>
        </div>
      </section>

      <section className="about-story">
        <div className="about-story__inner">
          <div className="about-story__text">
            {t.sections.map(([heading, body], i) => (
              <div key={i} style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.15rem', marginBottom: '0.5rem' }}>{heading}</h2>
                <p className="about-story__para">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Privacy;
