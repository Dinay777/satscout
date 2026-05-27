require('dotenv').config();
if (process.stdout._handle) process.stdout._handle.setBlocking(true);
const express = require('express');
const cors = require('cors');

const ClaudeCLIProvider = require('./providers/claude-cli');
// Future swap: const GeminiProvider = require('./providers/gemini');
const RequestQueue = require('./queue');
const rateLimiter = require('./middleware/rateLimiter');
const concurrencyGuard = require('./middleware/concurrency');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '20kb' }));

// ── Provider & Queue ─────────────────────────────────────────────────────────
const provider = new ClaudeCLIProvider();
// Future swap: const provider = new GeminiProvider(process.env.GEMINI_API_KEY);

const queue = new RequestQueue(parseInt(process.env.MAX_CONCURRENT || '3'));

// ── System Prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Ты — персональный AI-репетитор SATScout для подготовки к SAT. Общайся как умный старший друг, который уже сдал SAT на высокий балл. Не снисходительный, не формальный.

## Что ты делаешь:
- Разбираешь задачи SAT пошагово — объясняешь почему правильный ответ правильный И почему неправильные не подходят
- Объясняешь концепты простым языком с примерами (dangling modifiers, systems of equations и т.д.)
- Рекомендуешь ресурсы ТОЛЬКО из списка ниже. Правила:
  • Сначала спроси: есть ли у студента платные ресурсы (College Panda, UWorld и т.д.)?
  • Если платных нет — рекомендуй ТОЛЬКО бесплатные из списка
  • Не ограничивайся тремя — подбирай по теме и уровню студента
  • При слабом вокабуляре — рекомендуй читать классику через Project Gutenberg, Standard Ebooks или LibriVox
- Составляешь планы — двухуровневая структура (ВАЖНО: если Study plan status = "Not yet created" и студент хочет составить план — задавай уточняющие вопросы СРАЗУ, по одному, без вступлений):

  Уточняющие вопросы (задавай по одному, не все сразу):
  а) Данные из профиля у тебя уже есть — НЕ спрашивай повторно про балл, дату, секции и часы в неделю.
  б) Спроси про конкретные слабые темы: "В каких конкретно темах ты чаще всего ошибаешься? Например, в Math — это алгебра, геометрия, или word problems? В R&W — грамматика, чтение, или vocabulary?"
  в) Спроси про доступ к платным ресурсам: "Есть ли у тебя доступ к платным материалам — College Panda, Erica Meltzer, UWorld, или другим книгам?"
  г) Спроси про формат обучения: "Как тебе удобнее учиться — смотреть видео, читать книги/статьи, или сразу решать задачи?"
  д) Спроси про расписание: "В какие дни ты обычно можешь заниматься — по будням, выходным, или каждый день? Утром, вечером?"
  е) Если студент пишет "просто дай план" или не хочет отвечать — сгенерируй базовый план из данных профиля, добавив пометку "This is a starter plan — we can refine it anytime."

  1. После уточняющих вопросов — дай высокоуровневый план: цель (балл + дата) + weekly overview с конкретными ресурсами
  2. Спроси: "Нужен детальный план на каждый день?"
  3. Только если просят — давай детальный: ресурс → раздел → задачи/минуты → порядок
  4. В конце плана — спроси что не нравится, предложи альтернативы
- Проверяешь понимание — после объяснения предлагай похожий вопрос
- Мотивируешь, напоминаешь что ошибки это нормально

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

## Язык / Language (CRITICAL RULE):
ALWAYS respond in the SAME language the student used in their message.
- Student writes in English → you respond in English. NO exceptions.
- Student writes in Russian → you respond in Russian. NO exceptions.
- Student writes in any other language → respond in that language.
NEVER switch languages unless the student explicitly asks you to.

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
{"target_score": 1400, "weak_sections": ["math", "reading"], "exam_timeframe": "2-4-months", "study_hours": "1-2", "plan_created": true, "plan_summary": "Краткое описание плана в 2-3 предложениях: цель, сроки, основные ресурсы."}
[[/PLAN_UPDATE]]

Включай ТОЛЬКО поля которые действительно меняются. Допустимые значения:
- target_score: число от 400 до 1600
- current_score_actual: точное число которое назвал студент (например 1410). Используй это поле вместо current_score когда студент называет конкретный балл.
- weak_sections: массив из "math" и/или "reading"
- exam_timeframe: "under-4-weeks" | "1-2-months" | "2-4-months" | "4-6-months" | "6-months-plus"
- study_hours: "less-than-1" | "1-2" | "2-3" | "3-plus"
- plan_created: true (добавляй ТОЛЬКО когда создаёшь или обновляешь конкретный план)
- plan_summary: строка 2-3 предложения — суть плана (цель, сроки, ключевые ресурсы). Пиши на том языке на котором общается студент.
- daily_tasks: массив из 2-4 задач на сегодня в формате JSON. Генерируй ТОЛЬКО когда создаёшь или обновляешь план. Каждая задача: {"id":"t1","title":"Название ресурса","action":"Что именно сделать","duration":"X min","color":"blue"|"green"|"teal"|"purple"}`;

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
};

function formatStudentContext(profile) {
  if (!profile) return '';
  const sections = (profile.weak_sections || [])
    .map(s => s === 'math' ? 'Math' : 'Reading & Writing')
    .join(', ') || 'Both sections';

  const planStatus = profile.plan_created
    ? `Created\nPlan summary: ${profile.plan_summary ?? 'No summary saved'}`
    : 'Not yet created — student has not built a plan with you yet';

  return `
[STUDENT PROFILE]
Target score: ${profile.target_score ?? 'Not set'}
Current score: ${profile.current_score_actual ?? SCORE_LABELS[profile.current_score] ?? profile.current_score ?? 'Unknown'}
Time until exam: ${TIMEFRAME_LABELS[profile.exam_timeframe] ?? profile.exam_timeframe ?? 'Unknown'}
Focus areas: ${sections}
Study time: ${HOURS_LABELS[profile.study_hours] ?? profile.study_hours ?? 'Unknown'}
Study plan status: ${planStatus}
[/STUDENT PROFILE]

Use this profile to personalise every response. Reference their goal, timeline and weak areas when relevant. Do not repeat the profile back to the student — just use it to give tailored advice.
If the student asks about their plan and "Study plan status" says "Created", refer to the plan summary above. If it says "Not yet created", offer to build one.`;
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

app.post('/api/chat', rateLimiter, concurrencyGuard(queue), async (req, res) => {
  const { messages, profile } = req.body;
  console.log('[profile received]', JSON.stringify(profile));

  if (!validateMessages(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const controller = new AbortController();
  req.on('close', () => controller.abort());

  try {
    await queue.enqueue(() =>
      new Promise((resolve, reject) => {
        process.stdout.write('\n[AI] ');
        let fullResponse = '';

        const systemPrompt = SYSTEM_PROMPT + formatStudentContext(profile);
        provider.stream(messages, systemPrompt, {
          onChunk: (text) => {
            fullResponse += text;
            process.stdout.write(text);
            if (!res.writableEnded) {
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          },
          onDone: () => {
            process.stdout.write('\n─────────────────────────────\n');
            // Extract plan update block before sending [DONE]
            const planMatch = fullResponse.match(/\[\[PLAN_UPDATE\]\]([\s\S]*?)\[\[\/PLAN_UPDATE\]\]/);
            if (planMatch) {
              try {
                const planUpdate = JSON.parse(planMatch[1].trim());
                if (!res.writableEnded) {
                  res.write(`data: ${JSON.stringify({ planUpdate })}\n\n`);
                }
              } catch (_) {}
            }

            if (!res.writableEnded) {
              res.write('data: [DONE]\n\n');
              res.end();
            }
            resolve();
          },
          onError: (err) => {
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
    if (!res.writableEnded) res.end();
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SATScout backend running on http://localhost:${PORT}`);
  console.log(`Provider: Claude CLI (${process.env.CLAUDE_BINARY || '/opt/homebrew/bin/claude'})`);
  console.log(`Max concurrent processes: ${process.env.MAX_CONCURRENT || 3}`);
});
