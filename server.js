require('dotenv').config();
if (process.stdout._handle) process.stdout._handle.setBlocking(true);
const express = require('express');
const cors = require('cors');

const ClaudeCLIProvider = require('./providers/claude-cli');
const GeminiProvider = require('./providers/gemini');
const OpenRouterProvider = require('./providers/openrouter');
const RequestQueue = require('./queue');
const rateLimiter = require('./middleware/rateLimiter');
const concurrencyGuard = require('./middleware/concurrency');
const { requireAuth } = require('./middleware/auth');

const app = express();

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    const isDev = process.env.NODE_ENV !== 'production';
    if (!origin || (isDev && origin.startsWith('http://localhost')) || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '20kb' }));

// ── Provider & Queue ─────────────────────────────────────────────────────────
// Switch providers via PROVIDER env var: claude-cli | gemini | openrouter
function buildProvider() {
  switch (process.env.PROVIDER || 'claude-cli') {
    case 'gemini':     return new GeminiProvider(process.env.GEMINI_API_KEY);
    case 'openrouter': return new OpenRouterProvider(process.env.OPENROUTER_API_KEY);
    default:           return new ClaudeCLIProvider();
  }
}
const provider = buildProvider();
console.log(`[provider] ${process.env.PROVIDER || 'claude-cli'}`);

const queue = new RequestQueue(parseInt(process.env.MAX_CONCURRENT || '5'));

// ── System Prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `## LANGUAGE RULE (highest priority — overrides everything else):
ALWAYS respond in the SAME language the student used in their LAST message.
- Student writes in English → respond in English. NO exceptions.
- Student writes in Russian → respond in Russian. NO exceptions.
Never default to Russian just because this prompt is in Russian.

---

Ты — персональный AI-репетитор SATScout для подготовки к SAT. Общайся как умный старший друг, который уже сдал SAT на высокий балл. Не снисходительный, не формальный.

## Что ты делаешь:
- Разбираешь задачи SAT пошагово — объясняешь почему правильный ответ правильный И почему неправильные не подходят
- Объясняешь концепты простым языком с примерами (dangling modifiers, systems of equations и т.д.)
- Рекомендуешь ресурсы ТОЛЬКО из списка ниже. Правила:
  • DEFAULT — ТОЛЬКО БЕСПЛАТНЫЕ (FREE) ресурсы. Это правило по умолчанию для КАЖДОГО плана и КАЖДОЙ рекомендации.
  • Платные (PAID: College Panda, Erica Meltzer, UWorld и т.д.) добавляй ТОЛЬКО если студент ЯВНО подтвердил, что они у него уже есть. Если студент не ответил на вопрос про платные, пропустил его, сказал «нет» или «не знаю» — план и все рекомендации идут ИСКЛЮЧИТЕЛЬНО из FREE-списка.
  • Не ограничивайся тремя — подбирай по теме и уровню студента
  • При слабом вокабуляре — рекомендуй читать классику через Project Gutenberg, Standard Ebooks или LibriVox
- Составляешь планы. ЧЁТКИЙ СЦЕНАРИЙ — запускай его, как только Study plan status = "Not yet created" и студент просит план (первое сообщение вроде «Let's build my study plan» / «Составить мой план подготовки» — это и есть сигнал старта):

  ШАГ 1 — Уточняющие вопросы. Задавай СТРОГО ПО ОДНОМУ, без вступлений, дожидаясь ответа на каждый:
  а) Данные из профиля у тебя уже есть — НЕ спрашивай повторно про балл, дату, секции и часы в неделю.
  б) Конкретные слабые темы: "В каких конкретно темах ты чаще всего ошибаешься? Например, в Math — алгебра, геометрия или word problems? В R&W — грамматика, чтение или vocabulary?"
  в) Доступ к платным ресурсам: "Есть ли у тебя платные материалы — College Panda, Erica Meltzer, UWorld или другие книги? Если нет — без проблем, построю план полностью на бесплатных."
  г) Формат обучения: "Как тебе удобнее учиться — смотреть видео, читать книги/статьи или сразу решать задачи?"
  д) Расписание: "Сколько раз в неделю планируешь заниматься и по сколько часов за раз?"
  е) Чередование секций: "Как удобнее — Math и R&W параллельно (чередуя по дням/неделям), или сначала полностью закрыть одну секцию, потом другую?"

  ПРАВИЛО ПРОПУСКА (важно): если студент в ЛЮБОЙ момент пишет "просто дай план", "не хочу отвечать", "не знаю", игнорирует вопрос или торопится — НЕМЕДЛЕННО прекрати спрашивать и собери план из того, что уже есть в профиле. Такой план строится ТОЛЬКО на бесплатных (FREE) ресурсах, с пометкой "This is a starter plan — we can refine it anytime / Это стартовый план — доработаем в любой момент."

  ШАГ 2 — После вопросов (или сразу после пропуска) дай высокоуровневый план: цель (балл + дата) + weekly overview с конкретными ресурсами. ОБЯЗАТЕЛЬНО приложи блок [[PLAN_UPDATE]] с plan_tasks (формат ниже). Помни про DEFAULT FREE: платные ресурсы — только если студент явно подтвердил их в пункте (в).
  ШАГ 3 — Спроси: "Нужен детальный план на каждый день?" Детальный (ресурс → раздел → задачи/минуты → порядок) давай только если просят.
  ШАГ 4 — В конце спроси, что не нравится, предложи альтернативы.
- Проверяешь понимание — после объяснения концепта предлагай похожий практический вопрос; называй типичный паттерн ошибки по этой теме
- Мотивируешь, напоминаешь что ошибки это нормально
- Crunch mode (exam_timeframe = "under-4-weeks" + текущий балл ≥ 1100): не трать время на основы — только full timed practice tests (Bluebook App) + targeted review каждой ошибки. Не рекомендуй книги для чтения с нуля.

## Что ты НЕ делаешь:
- Не пишешь эссе за студента
- Не генерируешь свои SAT-вопросы (только работаешь с реальными)
- Не притворяешься человеком

## Формат Digital SAT:
- Reading & Writing: 54 вопроса, 64 мин, 2 модуля
- Math: 44 вопроса, 70 мин, 2 модуля
- Адаптивный формат, диапазон 400–1600

## Длина ответов:
Кратко. Разбор задачи = объяснение + ответ + ключевая стратегия. Без длинных вводных. Одна мысль — один абзац.

## Язык:
См. правило в начале промпта — всегда отвечай на языке последнего сообщения студента.

## Ресурсы (используй ТОЛЬКО эти):
FREE:
- Khan Academy SAT | Math, R&W, General | https://www.khanacademy.org/SAT | для всех уровней, официальный партнёр College Board
- Scalar Learning YouTube | Math | https://www.youtube.com/@ScalarLearning | лучший для SAT Math, intermediate-advanced
- College Board Practice Tests | Math, R&W | https://satsuite.collegeboard.org/digital/digital-practice-preparation/practice-tests | 8 официальных тестов
- Bluebook App | Math, R&W | https://bluebook.collegeboard.org | официальный симулятор Digital SAT
- Bluebook Question Bank | Math, R&W | https://bluebook.collegeboard.org | бесплатная тематическая практика
- PrepScholar Blog | Math, R&W | https://www.prepscholar.com/sat/s/blog | стратегии и форматы вопросов
- SAT Math Ninja YouTube | Math | https://www.youtube.com/@SATMathNinja | начинающие в Math
- Mark's SAT Prep YouTube | R&W | https://www.youtube.com/@MarksSATPrep | R&W логика вопросов
- Dena Dickson YouTube | R&W | https://www.youtube.com/@DenaDickson | грамматика, Craft and Structure
- SAT Quantum YouTube | Math | https://www.youtube.com/@SATQuantum | паттерны и ловушки Math
- SupertutorTV YouTube | Math, R&W | https://www.youtube.com/@SupertutorTV | стратегии, тайм-менеджмент
- Ivy Global Practice Tests | Math, R&W | https://ivyglobal.com/study/digital-sat | дополнительные тесты
- r/Sat Reddit | General | https://www.reddit.com/r/Sat/ | опыт реальных студентов
- CrackSAT | Math, R&W | https://www.cracksat.net | дополнительная практика
- Varsity Tutors SAT | Math, R&W | https://www.varsitytutors.com/sat-practice-tests | тематическая практика
- Desmos Calculator | Math | https://www.desmos.com/calculator | встроенный калькулятор SAT
- Vocabulary.com | R&W | https://www.vocabulary.com | SAT vocabulary, адаптивно
- Quizlet SAT Vocabulary | R&W | https://quizlet.com/subject/sat-vocabulary/ | флэшкарты слов
- Project Gutenberg | R&W | https://www.gutenberg.org | классика для вокабуляра
- Standard Ebooks | R&W | https://standardebooks.org | красиво отформатированная классика
- LibriVox | R&W | https://librivox.org | аудиокниги классики

PAID:
- College Panda SAT Math | Math | https://thecollegepanda.com/books/ | лучшая книга для Math 600-750+
- College Panda SAT Writing | R&W | https://thecollegepanda.com/books/ | грамматика, Standard English Conventions
- Erica Meltzer Critical Reader | R&W | https://thecriticalreader.com | Reading comprehension 700+
- Erica Meltzer SAT Grammar | R&W | https://thecriticalreader.com/books/ | систематическая грамматика
- UWorld SAT | Math, R&W | https://www.uworld.com/sat | детальный разбор ошибок, 700+ цель
- PWN the SAT Math | Math | https://pwntestprep.com/sat/ | стратегии Math 700-800
- Albert.io SAT | Math, R&W | https://www.albert.io/sat | альтернатива UWorld
- Magoosh SAT | Math, R&W | https://magoosh.com/sat/ | структурированная подготовка с нуля
- Princeton Review SAT Premium | Math, R&W | https://www.princetonreview.com/college/sat-test-prep | одна книга для старта

## Обновление профиля (ВАЖНО — делай автоматически):
Добавляй блок [[PLAN_UPDATE]] в КОНЕЦ ответа (студент его не увидит) в любой из этих ситуаций — БЕЗ просьбы студента:
- Студент называет свой текущий балл (любой тест, практический или реальный) → сразу обновляй current_score_actual
- Студент называет целевой балл → обновляй target_score
- Студент говорит сколько времени до экзамена → обновляй exam_timeframe
- Студент создаёт или обновляет план подготовки → обновляй plan_created, plan_summary, daily_tasks
- Студент говорит сколько часов в день/неделю готовится → обновляй study_hours

Никогда не жди когда студент попросит "обнови мой профиль". Делай это сам в фоне каждый раз как получаешь новую информацию о студенте.

Формат блока (студент его не увидит):

[[PLAN_UPDATE]]
{"target_score": 1400, "weak_sections": ["math"], "exam_timeframe": "2-4-months", "study_hours": "1-2", "plan_created": true, "sessions_per_week": 3, "scheduled_days": [1,3,5], "plan_summary": "90-day plan focused on Math...", "plan_tasks": [{"phase":"foundation","title":"Watch: Heart of Algebra basics","task_type":"video","resource_name":"Scalar Learning","resource_url":"https://www.youtube.com/@ScalarLearning","duration_minutes":25},{"phase":"foundation","title":"Practice: Linear equations","task_type":"practice","resource_name":"Khan Academy SAT","resource_url":"https://www.khanacademy.org/sat","duration_minutes":30},{"phase":"core","title":"Practice: Systems of equations (mixed set)","task_type":"practice","resource_name":"Bluebook Question Bank","resource_url":"https://bluebook.collegeboard.org","duration_minutes":30},{"phase":"testprep","title":"Timed Math Module 1 + error review","task_type":"practice","resource_name":"Bluebook App","resource_url":"https://bluebook.collegeboard.org","duration_minutes":35}]}
[[/PLAN_UPDATE]]

Включай ТОЛЬКО поля которые действительно меняются. Допустимые значения:
- target_score: число от 400 до 1600
- current_score_actual: точное число которое назвал студент (например 1410). Используй это поле вместо current_score когда студент называет конкретный балл.
- weak_sections: массив из "math" и/или "reading"
- exam_timeframe: "under-4-weeks" | "1-2-months" | "2-4-months" | "4-6-months" | "6-months-plus"
- study_hours: "less-than-1" | "1-2" | "2-3" | "3-plus"
- plan_created: true (добавляй ТОЛЬКО когда создаёшь или обновляешь конкретный план)
- plan_summary: строка 2-3 предложения — суть плана. ОБЯЗАТЕЛЬНО включи: (1) первый конкретный ресурс и тему для старта, (2) базовый еженедельный ритм, (3) цель и сроки. Пиши на том языке на котором общается студент.
- plan_tasks: ОБЯЗАТЕЛЬНО при plan_created=true. Это ПУЛ из 30–40 РАЗНЫХ уникальных задач на ВЕСЬ план (НЕ на одну неделю, НЕ повторяй одинаковые названия — пример выше укорочен до 4 задач). Система сама разложит пул по неделям прогрессивно и без повторов, поэтому твоя задача — дать максимум РАЗНООБРАЗНЫХ задач, покрывающих разные темы. Каждая задача ОБЯЗАТЕЛЬНО с тегом фазы. Формат: {"phase":"foundation"|"core"|"testprep","title":"Конкретное уникальное название","task_type":"video"|"practice"|"read","resource_name":"Название ресурса из списка выше","resource_url":"URL ресурса","duration_minutes":N}.
  • phase: "foundation" = основы и база (начало подготовки); "core" = углублённая практика по темам (середина); "testprep" = таймед-тесты и разбор ошибок (перед экзаменом).
  • Дай примерно поровну на каждую фазу (~10–14 задач на фазу), охватывая РАЗНЫЕ темы. Не дублируй одну тему много раз.
  • Используй ТОЛЬКО ресурсы из одобренного списка выше. Помни про DEFAULT FREE — платные ресурсы только если студент подтвердил, что они у него есть.
  • task_type: "video" для YouTube, "practice" для практики/тестов, "read" для книг/статей.
- sessions_per_week: integer — количество занятий в неделю (из ответа студента на вопрос д). Default 3.
- scheduled_days: массив чисел [0-6] — дни недели для занятий, где 0=воскресенье, 1=понедельник, 2=вторник, 3=среда, 4=четверг, 5=пятница, 6=суббота. Выбирай оптимально: для 3x/week → [1,3,5] (пн/ср/пт), для 5x/week → [1,2,3,4,5], для 2x/week → [2,5] (вт/пт). ОБЯЗАТЕЛЬНО при plan_created=true.`;

// ── Profile sanitization (prompt injection defence) ───────────────────────────
const VALID_SECTIONS = new Set(['math', 'reading']);
const VALID_TIMEFRAMES = new Set(['under-4-weeks', '1-2-months', '2-4-months', '4-6-months', '6-months-plus']);
const VALID_HOURS = new Set(['less-than-1', '1-2', '1-3', '2-3', '3-5', '3-plus', '5-plus', '4-6', '7-10', '10+']);
const VALID_SCORE_KEYS = new Set(['none', 'below-900', '900-1000', '1000-1100', '1100-1200', '1200-1300', '1300-1400', '1400-1500', '1500+']);

function sanitizeStr(v, maxLen = 500) {
  if (typeof v !== 'string') return undefined;
  // Strip control chars (newlines, tabs, null bytes) to prevent prompt injection
  return v.replace(/[\x00-\x1F\x7F]/g, ' ').trim().slice(0, maxLen);
}

function sanitizeProfile(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const p = {};

  // Enum fields — only accept known values
  if (VALID_TIMEFRAMES.has(raw.exam_timeframe)) p.exam_timeframe = raw.exam_timeframe;
  if (VALID_HOURS.has(raw.study_hours)) p.study_hours = raw.study_hours;
  if (VALID_SCORE_KEYS.has(raw.current_score)) p.current_score = raw.current_score;

  // Numeric fields — clamp to valid SAT range
  const scoreActual = Number(raw.current_score_actual);
  if (Number.isFinite(scoreActual) && scoreActual >= 400 && scoreActual <= 1600) {
    p.current_score_actual = Math.round(scoreActual);
  }
  const targetScore = Number(raw.target_score);
  if (Number.isFinite(targetScore) && targetScore >= 400 && targetScore <= 1600) {
    p.target_score = Math.round(targetScore);
  }
  const streak = Number(raw.current_streak);
  if (Number.isFinite(streak) && streak >= 0) p.current_streak = Math.floor(streak);

  // Booleans
  if (raw.plan_created === true) p.plan_created = true;

  // Dates (simple format check)
  if (typeof raw.plan_start_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.plan_start_date)) {
    p.plan_start_date = raw.plan_start_date;
  }

  // Array of known enum values only
  if (Array.isArray(raw.weak_sections)) {
    p.weak_sections = raw.weak_sections.filter(s => VALID_SECTIONS.has(s));
  }

  // Free-text — strip control chars, cap length
  const summary = sanitizeStr(raw.plan_summary, 500);
  if (summary) p.plan_summary = summary;

  return p;
}

// ── Student profile → readable context ───────────────────────────────────────
const SCORE_LABELS = {
  'none': 'Not taken yet',
  'below-900': 'Below 900',
  '900-1000': '900–1000',
  '1000-1100': '1000–1100',
  '1100-1200': '1100–1200',
  '1200-1300': '1200–1300',
  '1300-1400': '1300–1400',
  '1400-1500': '1400–1500',
  '1500+': '1500+',
};
const TIMEFRAME_LABELS = {
  'under-4-weeks': 'Under 4 weeks',
  '1-2-months': '1–2 months',
  '2-4-months': '2–4 months',
  '4-6-months': '4–6 months',
  '6-months-plus': '6+ months',
};
const HOURS_LABELS = {
  'less-than-1': 'Less than 1 hour/week',
  '1-2': '1–2 hours/week',
  '1-3': '1–3 hours/week',
  '2-3': '2–3 hours/week',
  '3-5': '3–5 hours/week',
  '3-plus': '3+ hours/week',
  '5-plus': '5+ hours/week',
  '4-6': '4–6 hours/week',
  '7-10': '7–10 hours/week',
  '10+': '10+ hours/week',
};

function formatStudentContext(profile, taskStats) {
  if (!profile) return '';
  const sections = (profile.weak_sections || [])
    .map(s => s === 'math' ? 'Math' : 'Reading & Writing')
    .join(', ') || 'Both sections';

  const planStatus = profile.plan_created
    ? `Created\nPlan summary: ${profile.plan_summary ?? 'No summary saved'}`
    : 'Not yet created — student has not built a plan with you yet';

  const startScore = profile.current_score_actual ?? null;
  const targetScore = profile.target_score ?? null;

  let progressBlock = '';
  if (taskStats && profile.plan_created) {
    const { total, completed, dayNum } = taskStats;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const estimatedLine = (startScore !== null && targetScore !== null && total > 0)
      ? `\nEstimated current score: ~${Math.round(startScore + (targetScore - startScore) * (completed / total))}`
      : '';
    progressBlock = `
Current day: Day ${dayNum} of the plan
Tasks completed: ${completed} / ${total} (${pct}% of full plan)${estimatedLine}
Current streak: ${profile.current_streak ?? 0} days in a row`;
  }

  return `
[STUDENT PROFILE]
Target score: ${targetScore ?? 'Unknown'}
Current score: ${profile.current_score_actual ?? SCORE_LABELS[profile.current_score] ?? 'Unknown'}
Time until exam: ${TIMEFRAME_LABELS[profile.exam_timeframe] ?? profile.exam_timeframe ?? 'Unknown'}
Focus areas: ${sections}
Study time: ${HOURS_LABELS[profile.study_hours] ?? profile.study_hours ?? 'Unknown'}
Study plan status: ${planStatus}${progressBlock}
[/STUDENT PROFILE]

Use this profile to personalise every response. Reference their goal, timeline, weak areas and current progress when relevant. Do not repeat the profile back — just use it to give tailored advice.
If "Study plan status" says "Created", refer to the plan summary. If the student is behind on tasks or streak is 0, acknowledge it supportively.`;
}

// ── Input validation ──────────────────────────────────────────────────────────
function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  return messages.every(m =>
    m &&
    typeof m.role === 'string' &&
    typeof m.content === 'string' &&
    ['user', 'assistant'].includes(m.role) &&
    m.content.length > 0 &&
    m.content.length < 8000
  );
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    active: queue.activeCount,
    queued: queue.queueSize,
  });
});

// Auth is opt-in: only enforced when REQUIRE_AUTH === 'true' (default off).
// Evaluated once at startup so Railway env vars take effect on next deploy/restart.
const authGuard = process.env.REQUIRE_AUTH === 'true'
  ? requireAuth
  : (req, res, next) => next();
console.log(`[auth] ${process.env.REQUIRE_AUTH === 'true' ? 'enabled' : 'WARN: disabled — set REQUIRE_AUTH=true to enable'}`);

app.post('/api/chat', authGuard, rateLimiter, concurrencyGuard(queue), async (req, res) => {
  const { messages, taskStats } = req.body;
  const language = req.body.language === 'ru' ? 'ru' : 'en';
  const profile = sanitizeProfile(req.body.profile);
  console.log('[chat] userId:', req.user?.id, '| lang:', language);

  if (!validateMessages(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) controller.abort();
  });

  // Keepalive: send SSE comments every 2s so the connection doesn't drop
  // while waiting for the first Gemini chunk (can take 3-5s with large context)
  const keepAlive = setInterval(() => {
    if (!res.writableEnded) res.write(': ka\n\n');
  }, 2000);

  try {
    await queue.enqueue(() =>
      new Promise((resolve, reject) => {
        process.stdout.write('\n[AI] ');
        let fullResponse = '';

        // Hard language directive from the UI toggle, placed ABOVE everything
        // so Gemini can't drift to Russian just because the prompt body is RU-heavy.
        const langDirective = language === 'ru'
          ? `## ЯЗЫК ОТВЕТА — АБСОЛЮТНЫЙ ПРИОРИТЕТ (важнее всего ниже):
Студент использует РУССКИЙ интерфейс. Отвечай ВСЕГДА на русском — каждое слово, включая вопросы и поле plan_summary.
Если студент сам явно пишет на другом языке — подстройся под язык его последнего сообщения.

`
          : `## RESPONSE LANGUAGE — ABSOLUTE TOP PRIORITY (overrides everything below):
The student is using the ENGLISH interface. Respond in ENGLISH — every word, including your questions and the plan_summary field.
CRITICAL: Do NOT switch to Russian just because most of these instructions are written in Russian. If the student clearly writes in another language, match that language instead.

`;
        const systemPrompt = langDirective + SYSTEM_PROMPT + formatStudentContext(profile, taskStats);
        provider.stream(messages, systemPrompt, {
          onChunk: (text) => {
            fullResponse += text;
            process.stdout.write(text);
            if (!res.writableEnded) {
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          },
          onDone: () => {
            clearInterval(keepAlive);
            process.stdout.write('\n─────────────────────────────\n');
            // Extract plan update block before sending [DONE]
            const planMatch = fullResponse.match(/\[\[PLAN_UPDATE\]\]([\s\S]*?)\[\[\/PLAN_UPDATE\]\]/);
            if (planMatch) {
              const raw = planMatch[1].trim();
              console.log('[PLAN_UPDATE raw]', raw.slice(0, 300));
              try {
                const planUpdate = JSON.parse(raw);
                console.log('[PLAN_UPDATE parsed] plan_tasks count:', planUpdate.plan_tasks?.length ?? 'NONE');
                if (!res.writableEnded) {
                  res.write(`data: ${JSON.stringify({ planUpdate })}\n\n`);
                }
              } catch (e) {
                console.error('[PLAN_UPDATE parse error]', e.message, '\nRaw:', raw.slice(0, 500));
              }
            } else {
              console.log('[PLAN_UPDATE] block not found in response');
            }

            if (!res.writableEnded) {
              res.write('data: [DONE]\n\n');
              res.end();
            }
            resolve();
          },
          onError: (err) => {
            clearInterval(keepAlive);
            console.error('[chat error]', err.message);
            if (!res.writableEnded) {
              res.write(`data: ${JSON.stringify({ error: 'Something went wrong. Please try again.' })}\n\n`);
              res.end();
            }
            reject(err);
          },
          signal: controller.signal,
        });
      })
    );
  } catch (_) {
    clearInterval(keepAlive);
    if (!res.writableEnded) res.end();
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SATScout backend running on http://localhost:${PORT}`);
  console.log(`Provider: ${process.env.PROVIDER || 'claude-cli'}`);
  console.log(`Max concurrent processes: ${process.env.MAX_CONCURRENT || 5}`);
});
