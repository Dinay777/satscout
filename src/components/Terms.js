import React from 'react';

const text = {
  en: {
    badge: 'Terms',
    title: 'Terms of Use',
    updated: 'Last updated: September 2026',
    sections: [
      ['The service', 'SATScout is a free tool that helps you prepare for the SAT using curated free resources and an AI study assistant. We offer it as-is and do our best to keep it running, but we can’t guarantee uninterrupted access.'],
      ['No score guarantee', 'Study plans, recommendations, and AI answers are educational aids, not guarantees. Your results depend on your own effort. SATScout is not affiliated with the College Board, and "SAT" is a trademark of its respective owner.'],
      ['Use it fairly', 'Use SATScout for your own SAT prep. Don’t abuse the AI, attempt to overload the service, scrape it, or use it for anything unlawful. We may limit or suspend accounts that do.'],
      ['AI answers', 'The AI can make mistakes. Always double-check important facts and calculations. Do not rely on it for anything outside SAT study help.'],
      ['Your account', 'You are responsible for keeping your login secure. Tell us if you notice unauthorized use of your account.'],
      ['Changes', 'We may update these terms or the product over time. Continued use after changes means you accept the updated terms.'],
      ['Contact', 'Questions? Email dinaytaalaibekova@gmail.com.'],
    ],
  },
  ru: {
    badge: 'Условия',
    title: 'Условия использования',
    updated: 'Обновлено: сентябрь 2026',
    sections: [
      ['Сервис', 'SATScout — бесплатный инструмент для подготовки к SAT с проверенными бесплатными ресурсами и AI-помощником. Мы предоставляем его «как есть» и стараемся поддерживать работу, но не можем гарантировать бесперебойный доступ.'],
      ['Без гарантии баллов', 'Планы, рекомендации и ответы AI — это учебные помощники, а не гарантии. Твой результат зависит от твоих усилий. SATScout не связан с College Board, а «SAT» — товарный знак соответствующего владельца.'],
      ['Используй честно', 'Используй SATScout для собственной подготовки к SAT. Не злоупотребляй AI, не перегружай сервис, не занимайся скрапингом и не используй платформу в незаконных целях. Мы можем ограничить или заблокировать такие аккаунты.'],
      ['Ответы AI', 'AI может ошибаться. Всегда перепроверяй важные факты и вычисления. Не полагайся на него в вопросах вне подготовки к SAT.'],
      ['Твой аккаунт', 'Ты отвечаешь за безопасность своего входа. Сообщи нам, если заметишь несанкционированный доступ к аккаунту.'],
      ['Изменения', 'Мы можем со временем обновлять эти условия или продукт. Продолжение использования после изменений означает согласие с обновлёнными условиями.'],
      ['Контакты', 'Вопросы? Пиши на dinaytaalaibekova@gmail.com.'],
    ],
  },
};

function Terms({ language }) {
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

export default Terms;
