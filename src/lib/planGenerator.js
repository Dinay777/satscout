import { supabase } from './supabase';

const TIMEFRAME_DAYS = {
  'under-4-weeks': 21,
  '1-2-months': 45,
  '2-4-months': 90,
  '4-6-months': 150,
  '6-months-plus': 180,
};

const TASKS_PER_DAY = {
  'less-than-1': 2,
  '1-2': 2,
  '2-3': 3,
  '3-plus': 3,
};

// Map legacy Onboarding study_hours values to TASKS_PER_DAY keys
const STUDY_HOURS_MAP = {
  '1-3':  '1-2',
  '4-6':  '2-3',
  '7-10': '3-plus',
  '10+':  '3-plus',
};

function normalizeStudyHours(val) {
  return STUDY_HOURS_MAP[val] ?? val;
}

// Paid resources that must NOT appear in a default plan unless the student
// confirmed they own them. Matched by resource_name against the task pools.
const PAID_RESOURCE_NAMES = new Set([
  'College Panda Math',
  'College Panda Writing',
  'Erica Meltzer Critical Reader',
  'Erica Meltzer Grammar',
  'UWorld SAT',
  'PWN the SAT Math',
  'Princeton Review SAT Premium',
  'Albert.io SAT',
  'Magoosh SAT',
]);

const MATH_TASKS = {
  foundation: [
    { title: 'Watch: Heart of Algebra overview', task_type: 'video', resource_name: 'Scalar Learning', resource_url: 'https://www.youtube.com/@ScalarLearning', duration_minutes: 20 },
    { title: 'Practice: Linear equations (10 questions)', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 30 },
    { title: 'Watch: Problem-solving strategies for SAT', task_type: 'video', resource_name: 'The Organic Chemistry Tutor', resource_url: 'https://www.youtube.com/@TheOrganicChemistryTutor', duration_minutes: 20 },
    { title: 'Practice: Ratios & proportions', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 30 },
    { title: 'Watch: Systems of equations explained', task_type: 'video', resource_name: 'Scalar Learning', resource_url: 'https://www.youtube.com/@ScalarLearning', duration_minutes: 25 },
    { title: 'Practice: Quadratic equations drill', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Watch: Percentages & word problems', task_type: 'video', resource_name: 'The Organic Chemistry Tutor', resource_url: 'https://www.youtube.com/@TheOrganicChemistryTutor', duration_minutes: 20 },
    { title: 'Practice: Inequalities & number line', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 25 },
    { title: 'Watch: Functions — input/output basics', task_type: 'video', resource_name: 'SAT Quantum', resource_url: 'https://www.youtube.com/@SATQuantum', duration_minutes: 20 },
    { title: 'Practice: Word problems — translating to equations', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 30 },
    { title: 'Watch: Exponents & roots fundamentals', task_type: 'video', resource_name: 'Scalar Learning', resource_url: 'https://www.youtube.com/@ScalarLearning', duration_minutes: 20 },
    { title: 'Practice: 8 Bluebook foundation questions', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 25 },
    { title: 'Watch: Reading graphs & tables', task_type: 'video', resource_name: 'The Organic Chemistry Tutor', resource_url: 'https://www.youtube.com/@TheOrganicChemistryTutor', duration_minutes: 15 },
    { title: 'Practice: Rate, speed, distance problems', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 25 },
  ],
  core: [
    { title: 'Read: Algebra chapter + worked examples', task_type: 'read', resource_name: 'College Panda Math', resource_url: 'https://thecollegepanda.com/books/', duration_minutes: 40 },
    { title: 'Watch: Advanced Math patterns', task_type: 'video', resource_name: 'SAT Quantum', resource_url: 'https://www.youtube.com/@SATQuantum', duration_minutes: 25 },
    { title: 'Practice: 10 Bluebook questions — mixed', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 35 },
    { title: 'Read: Statistics & Data Analysis chapter', task_type: 'read', resource_name: 'College Panda Math', resource_url: 'https://thecollegepanda.com/books/', duration_minutes: 40 },
    { title: 'Watch: Geometry — triangles & circles', task_type: 'video', resource_name: 'Scalar Learning', resource_url: 'https://www.youtube.com/@ScalarLearning', duration_minutes: 25 },
    { title: 'Practice: Timed 10-question set (15 min)', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 20 },
    { title: 'Read: Quadratics & polynomials chapter', task_type: 'read', resource_name: 'College Panda Math', resource_url: 'https://thecollegepanda.com/books/', duration_minutes: 35 },
    { title: 'Watch: Scatterplots & line of best fit', task_type: 'video', resource_name: 'SAT Quantum', resource_url: 'https://www.youtube.com/@SATQuantum', duration_minutes: 20 },
    { title: 'Practice: Systems of equations — 8 questions', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Read: Trigonometry basics chapter', task_type: 'read', resource_name: 'College Panda Math', resource_url: 'https://thecollegepanda.com/books/', duration_minutes: 30 },
    { title: 'Watch: Complex numbers & imaginary i', task_type: 'video', resource_name: 'SAT Quantum', resource_url: 'https://www.youtube.com/@SATQuantum', duration_minutes: 20 },
    { title: 'Practice: Data & statistics — 10 questions', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Watch: Absolute value & piecewise functions', task_type: 'video', resource_name: 'Scalar Learning', resource_url: 'https://www.youtube.com/@ScalarLearning', duration_minutes: 20 },
    { title: 'Practice: Geometry & measurement questions', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
  ],
  testprep: [
    { title: 'Practice: Full Math Module 1 timed (35 min)', task_type: 'practice', resource_name: 'Bluebook App', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 35 },
    { title: 'Review: Analyze every mistake — note the topic', task_type: 'read', resource_name: 'Your notes', resource_url: null, duration_minutes: 20 },
    { title: 'Practice: Full Math Module 2 timed (35 min)', task_type: 'practice', resource_name: 'Bluebook App', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 35 },
    { title: 'Watch: Exam-day strategy & time management', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 20 },
    { title: 'Practice: Extra Math section (timed)', task_type: 'practice', resource_name: 'CrackSAT Practice Tests', resource_url: 'https://cracksat.net', duration_minutes: 40 },
    { title: 'Review: Weak topic targeted drill', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Watch: Hard question techniques (700+ level)', task_type: 'video', resource_name: 'SAT Quantum', resource_url: 'https://www.youtube.com/@SATQuantum', duration_minutes: 25 },
    { title: 'Practice: 20-question mixed timed set', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Review: Full practice test error log', task_type: 'read', resource_name: 'Your notes', resource_url: null, duration_minutes: 25 },
  ],
};

const READING_TASKS = {
  foundation: [
    { title: 'Watch: SAT R&W question types overview', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 20 },
    { title: 'Practice: Grammar exercises — basics', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 30 },
    { title: 'Watch: Standard English Conventions rules', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 20 },
    { title: 'Practice: Craft & Structure questions (8 q)', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 30 },
    { title: 'Watch: Reading comprehension — main idea & purpose', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 25 },
    { title: 'Practice: 10 R&W Bluebook questions', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Watch: Punctuation rules — commas & semicolons', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 20 },
    { title: 'Practice: Subject-verb agreement drill', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 25 },
    { title: 'Watch: Inference & evidence questions', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 20 },
    { title: 'Practice: Pronoun & modifier questions', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 25 },
    { title: 'Watch: Rhetorical purpose question type', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 15 },
    { title: 'Practice: 8 Bluebook R&W mixed questions', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 25 },
    { title: 'Watch: Vocabulary in context strategies', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 20 },
    { title: 'Practice: Sentence completion & clarity', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 25 },
  ],
  core: [
    { title: 'Read: Grammar rules — chapters 1-3', task_type: 'read', resource_name: 'Erica Meltzer Grammar', resource_url: 'https://thecriticalreader.com/books/', duration_minutes: 40 },
    { title: 'Watch: Transitions & logical connectors', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 20 },
    { title: 'Practice: 15 R&W Bluebook questions (mixed)', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Read: Reading comprehension — chapter 1', task_type: 'read', resource_name: 'Erica Meltzer Critical Reader', resource_url: 'https://thecriticalreader.com', duration_minutes: 40 },
    { title: 'Watch: Vocabulary in context — advanced', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 20 },
    { title: 'Practice: Timed grammar set (20 min)', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 25 },
    { title: 'Read: Rhetorical analysis — chapter 2', task_type: 'read', resource_name: 'Erica Meltzer Critical Reader', resource_url: 'https://thecriticalreader.com', duration_minutes: 35 },
    { title: 'Watch: Cross-text questions strategy', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 20 },
    { title: 'Practice: Evidence-based reading questions', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Read: Sentence structure & parallel construction', task_type: 'read', resource_name: 'Erica Meltzer Grammar', resource_url: 'https://thecriticalreader.com/books/', duration_minutes: 30 },
    { title: 'Watch: Passage structure & author\'s purpose', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 20 },
    { title: 'Practice: Inference & command of evidence', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Watch: Notes-based questions (new SAT format)', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 20 },
    { title: 'Practice: Boundaries & sentence construction', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 25 },
  ],
  testprep: [
    { title: 'Practice: Full R&W Module 1 timed (32 min)', task_type: 'practice', resource_name: 'Bluebook App', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 32 },
    { title: 'Review: Categorize all R&W mistakes by type', task_type: 'read', resource_name: 'Your notes', resource_url: null, duration_minutes: 20 },
    { title: 'Practice: Full R&W Module 2 timed (32 min)', task_type: 'practice', resource_name: 'Bluebook App', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 32 },
    { title: 'Watch: Final strategy — what to do in last 5 min', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 20 },
    { title: 'Practice: Extra R&W section (timed)', task_type: 'practice', resource_name: 'CrackSAT Practice Tests', resource_url: 'https://cracksat.net', duration_minutes: 32 },
    { title: 'Review: Targeted drill on weakest R&W category', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 25 },
    { title: 'Watch: High-difficulty R&W question walkthrough', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 20 },
    { title: 'Practice: 20-question timed mixed R&W set', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 28 },
    { title: 'Review: Error log — patterns & frequency', task_type: 'read', resource_name: 'Your notes', resource_url: null, duration_minutes: 20 },
  ],
};

// The intense foundation→core→testprep block is capped at this many weeks and
// always sits in the RUN-UP to the exam (peak intensity right before test day).
const MAX_STRUCTURED_WEEKS = 14;
// Fallback horizon when we have neither a real exam date nor a usable timeframe
// bucket — never stall plan generation on a missing date (Decision B).
const DEFAULT_HORIZON_WEEKS = 8;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// How many weeks until the exam, counted from TODAY (the plan-generation date).
// Prefers a REAL exam date if the profile ever stores one — today only the coarse
// `exam_timeframe` bucket is written (Onboarding + [[PLAN_UPDATE]]), so the bucket
// path is what actually runs; the date path is here so a future date field works
// with no further change. Always >= 1 week (past/today/tomorrow clamp to a 1-week
// crunch plan).
function computeWeeksUntilExam(profile) {
  const dateStr = profile.exam_date || profile.test_date || null;
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const exam = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((exam.getTime() - today.getTime()) / MS_PER_DAY);
    return Math.max(1, Math.ceil(days / 7));
  }
  // No real date → keep the existing coarse horizon so existing data doesn't break.
  const bucketDays = TIMEFRAME_DAYS[profile.exam_timeframe];
  if (bucketDays) return Math.max(1, Math.ceil(bucketDays / 7));
  // Neither a date nor a usable bucket → default horizon (Decision B).
  return DEFAULT_HORIZON_WEEKS;
}

// Phase for a session WITHIN the structured block (1-based index over the block's
// total sessions). Foundation early, testprep right before the exam. In crunch
// mode (<= 3 weeks to exam) foundation is skipped and the weight shifts to
// testprep — no time for basics.
function getStructuredPhase(sessionIndex, totalStructured, crunch) {
  const pct = totalStructured > 0 ? sessionIndex / totalStructured : 1;
  if (crunch) return pct < 0.34 ? 'core' : 'testprep';
  if (pct < 0.35) return 'foundation';
  if (pct < 0.75) return 'core';
  return 'testprep';
}

// Specific topics filler tasks cycle through, so a "review" task names a real
// concept ("Systems of equations") instead of a bare number. Math + R&W mixed.
const FILLER_TOPICS = [
  { en: 'Heart of Algebra',            ru: 'Линейные уравнения' },
  { en: 'Systems of equations',        ru: 'Системы уравнений' },
  { en: 'Quadratics & polynomials',    ru: 'Квадратичные и многочлены' },
  { en: 'Nonlinear functions',         ru: 'Нелинейные функции' },
  { en: 'Ratios, rates & proportions', ru: 'Отношения, доли и пропорции' },
  { en: 'Percentages & word problems', ru: 'Проценты и текстовые задачи' },
  { en: 'Data & statistics',           ru: 'Данные и статистика' },
  { en: 'Geometry & trigonometry',     ru: 'Геометрия и тригонометрия' },
  { en: 'Functions & graphs',          ru: 'Функции и графики' },
  { en: 'Exponents & radicals',        ru: 'Степени и корни' },
  { en: 'Grammar & punctuation',       ru: 'Грамматика и пунктуация' },
  { en: 'Sentence boundaries',         ru: 'Границы предложений' },
  { en: 'Transitions & logic',         ru: 'Переходы и логика' },
  { en: 'Command of evidence',         ru: 'Работа с доказательствами' },
  { en: 'Craft & structure',           ru: 'Craft & Structure' },
  { en: 'Vocabulary in context',       ru: 'Вокабуляр в контексте' },
  { en: 'Rhetorical purpose',          ru: 'Риторическая цель' },
  { en: 'Inference questions',         ru: 'Вопросы на вывод' },
];

// Filler activity templates — FREE resources only, varied so consecutive filler
// days never look identical. Every template is topic-specific so none collapses
// to an identical string when reused.
const FILLER_TEMPLATES = [
  { kind: 'practice', en: t => `Timed drill: ${t} (15 questions)`,          ru: t => `Тренировка на время: ${t} (15 вопросов)`,     task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
  { kind: 'review',   en: t => `Error review: rework your ${t} mistakes`,   ru: t => `Разбор ошибок: переделай ошибки по теме «${t}»`, task_type: 'read',     resource_name: 'Your notes',            resource_url: null,                              duration_minutes: 20 },
  { kind: 'practice', en: t => `Practice set: ${t}`,                        ru: t => `Практика: ${t}`,                             task_type: 'practice', resource_name: 'Khan Academy SAT',      resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 25 },
  { kind: 'practice', en: t => `Full timed section — focus on ${t}`,        ru: t => `Секция на время — упор на «${t}»`,            task_type: 'practice', resource_name: 'Bluebook App',          resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 35 },
  { kind: 'review',   en: t => `Concept refresher: ${t}`,                   ru: t => `Освежи концепт: ${t}`,                       task_type: 'read',     resource_name: 'Khan Academy SAT',      resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 20 },
  { kind: 'practice', en: t => `Watch + take notes: ${t}`,                  ru: t => `Смотри и конспектируй: ${t}`,                task_type: 'video',    resource_name: 'SupertutorTV',          resource_url: 'https://www.youtube.com/@supertutortv', duration_minutes: 20 },
];

// Graceful, low-repeat filler. Used in two places: (1) the LIGHT MAINTENANCE
// weeks that pad a far-out exam, and (2) when the AI/curated task pool is smaller
// than the structured block has slots. Template and topic indices are DECOUPLED
// (template = n mod P, topic = floor(n/P) mod T) so up to P×T distinct filler
// tasks cycle before any repeat — the tail of a plan no longer reads as "the
// same two tasks." FREE resources only. `ru` matches the student's language.
// `kind` ('review' | 'practice') forces a matching template; else all rotate.
function makeFillerTask(n, ru, kind) {
  const i = n - 1; // n is 1-based
  const pool = kind ? FILLER_TEMPLATES.filter(t => t.kind === kind) : FILLER_TEMPLATES;
  const tpl = pool[i % pool.length];
  const topic = FILLER_TOPICS[Math.floor(i / pool.length) % FILLER_TOPICS.length];
  const topicStr = ru ? topic.ru : topic.en;
  return {
    title: (ru ? tpl.ru : tpl.en)(topicStr),
    task_type: tpl.task_type,
    resource_name: tpl.resource_name,
    resource_url: tpl.resource_url,
    duration_minutes: tpl.duration_minutes,
  };
}

export async function generateAndSavePlan(profile, userId, aiTasks = null, scheduledDays = null) {
  const tasksPerDay = TASKS_PER_DAY[normalizeStudyHours(profile.study_hours)] ?? 2;
  const sections = profile.weak_sections ?? ['math', 'reading'];
  const focusMath = sections.includes('math');
  const focusReading = sections.includes('reading');

  // ── Timeline anchoring (Phase 2) ───────────────────────────────────────────
  // Anchor the plan to the exam. The intense foundation→core→testprep block is
  // capped at MAX_STRUCTURED_WEEKS and placed in the RUN-UP to the exam (peak
  // intensity right before test day). If the exam is further out, the surplus
  // EARLIER weeks become a LIGHT MAINTENANCE phase (~1–2 unique review tasks per
  // week) so the student ticks over without burning out months in advance, then
  // ramps into the structured block. Crunch (<= 3 weeks) skips foundation.
  const weeksUntilExam = computeWeeksUntilExam(profile);
  const hasSchedule = !!scheduledDays?.length;
  const structuredWeeks = Math.min(weeksUntilExam, MAX_STRUCTURED_WEEKS);
  // Maintenance padding runs ONLY in schedule mode. There, the padded weeks'
  // empty days render as "Rest Day" and the session-based streak survives them.
  // In no-schedule (dense 7-day) mode the legacy day-based streak would break on
  // those empty maintenance days (student loses streak through no fault), so we
  // skip padding entirely and just run the structured block from today.
  const maintenanceWeeks = hasSchedule ? Math.max(0, weeksUntilExam - structuredWeeks) : 0;
  const crunch = weeksUntilExam <= 3;
  const sessionsPerWeek = scheduledDays?.length || 7;
  const maintenanceSessions = maintenanceWeeks * sessionsPerWeek;
  const structuredSessions = structuredWeeks * sessionsPerWeek;
  const totalSessions = maintenanceSessions + structuredSessions;

  await supabase.from('user_tasks').delete().eq('user_id', userId);

  // Language for generated (non-AI) strings: from the AI pool when present, else
  // the stored profile language, else sniff the saved plan summary; default English.
  const ru = aiTasks?.length
    ? aiTasks.some(t => /[А-Яа-яЁё]/.test(t?.title || ''))
    : (profile.language === 'ru' || /[А-Яа-яЁё]/.test(profile.plan_summary || ''));

  const allTasks = [];
  let fillerN = 0;
  const push = (session, t) => allTasks.push({
    user_id: userId,
    day_number: session,
    task_title: t.title,
    task_type: t.task_type,
    resource_name: t.resource_name,
    resource_url: t.resource_url ?? null,
    duration_minutes: t.duration_minutes ?? 30,
    completed: false,
  });

  // ── Structured-block task source: AI pool (no-repeat) or curated fallback ───
  // `structuredTasks(phase, idx)` yields the tasksPerDay task objects for ONE
  // structured session. Maintenance + pool-exhaustion filler share `fillerN`, so
  // every generated review task carries a unique number — zero repeats anywhere.
  let structuredTasks;

  if (aiTasks?.length) {
    // HYBRID distributor — DISTINCT, progressively harder tasks, NO repeats. The
    // AI hands us a POOL of unique phase-tagged tasks; we draw the NEXT UNUSED
    // task from the session's phase bucket. Cursors only move forward (no modulo
    // wrap), so no week repeats. When a bucket runs dry we borrow the next unused
    // task from any other bucket (foundation→core→testprep order) so no unique
    // task is wasted; only once EVERY real task is used do we emit numbered filler.
    const PHASES = ['foundation', 'core', 'testprep'];
    const byPhase = { foundation: [], core: [], testprep: [] };
    for (const t of aiTasks) {
      const ph = PHASES.includes(t.phase) ? t.phase : 'core';
      byPhase[ph].push(t);
    }
    const cursor = { foundation: 0, core: 0, testprep: 0 };
    const takeFromPhase = (ph) =>
      cursor[ph] < byPhase[ph].length ? byPhase[ph][cursor[ph]++] : null;
    const takeAny = () => {
      for (const ph of PHASES) {
        const t = takeFromPhase(ph);
        if (t) return t;
      }
      return null;
    };
    structuredTasks = (phase) => {
      const out = [];
      for (let i = 0; i < tasksPerDay; i++) {
        out.push(takeFromPhase(phase) ?? takeAny() ?? makeFillerTask(++fillerN, ru));
      }
      return out;
    };
  } else {
    // Curated fallback (AI returned no tasks). Gate paid resources unless the
    // student confirmed they own them — filter by resource name; data untouched.
    // FORWARD-ONLY, no modulo wrap: each curated task is drawn at most once, and
    // once a section is exhausted we emit varied filler instead of cycling the
    // same ~14 tasks over and over (the old modulo bug).
    const allowPaid = profile.has_paid_resources === true;
    const isPaid = (t) => PAID_RESOURCE_NAMES.has(t.resource_name);
    const PHASES = ['foundation', 'core', 'testprep'];
    const build = (SRC) => {
      const byPhase = {};
      for (const ph of PHASES) byPhase[ph] = allowPaid ? SRC[ph].slice() : SRC[ph].filter(t => !isPaid(t));
      return byPhase;
    };
    const buckets = { math: build(MATH_TASKS), reading: build(READING_TASKS) };
    const cursor = {
      math:    { foundation: 0, core: 0, testprep: 0 },
      reading: { foundation: 0, core: 0, testprep: 0 },
    };
    // Draw the next UNUSED curated task from a section: try the session's phase,
    // then fall forward through the remaining phases so no unique task is wasted.
    // Returns null only when the whole section is exhausted.
    const takeCurated = (section, phase) => {
      const cur = buckets[section];
      const cIdx = cursor[section];
      const order = [phase, ...PHASES.filter(p => p !== phase)];
      for (const ph of order) {
        if (cIdx[ph] < cur[ph].length) return cur[ph][cIdx[ph]++];
      }
      return null;
    };
    const draw = (section, phase) => takeCurated(section, phase) ?? makeFillerTask(++fillerN, ru);

    structuredTasks = (phase, sIdx) => {
      const dayTasks = [];
      if (focusMath && focusReading) {
        dayTasks.push(draw('math', phase));
        dayTasks.push(draw('reading', phase));
        if (tasksPerDay >= 3) dayTasks.push(draw(sIdx % 2 === 0 ? 'math' : 'reading', phase));
      } else {
        const section = focusMath ? 'math' : 'reading';
        for (let i = 0; i < tasksPerDay; i++) dayTasks.push(draw(section, phase));
      }
      return dayTasks;
    };
  }

  // ── Emit the whole horizon: maintenance weeks first, structured block last ──
  for (let session = 1; session <= totalSessions; session++) {
    const week = Math.floor((session - 1) / sessionsPerWeek);
    const sessionInWeek = (session - 1) % sessionsPerWeek;

    if (week < maintenanceWeeks) {
      // LIGHT MAINTENANCE: ~1–2 unique tasks/week (error review + one timed
      // practice); the other sessions are rest days (Dashboard shows "Rest Day").
      if (sessionInWeek === 0) push(session, makeFillerTask(++fillerN, ru, 'review'));
      else if (sessionInWeek === 1) push(session, makeFillerTask(++fillerN, ru, 'practice'));
    } else {
      const sIdx = session - maintenanceSessions; // 1-based within the structured block
      const phase = getStructuredPhase(sIdx, structuredSessions, crunch);
      for (const t of structuredTasks(phase, sIdx)) push(session, t);
    }
  }

  if (allTasks.length === 0) throw new Error('No tasks generated — check profile fields');

  for (let i = 0; i < allTasks.length; i += 100) {
    const { error } = await supabase.from('user_tasks').insert(allTasks.slice(i, i + 100));
    if (error) throw new Error(`Insert failed: ${error.message} (code: ${error.code})`);
  }

  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const profileUpdate = { plan_start_date: today, plan_created: true };
  if (scheduledDays?.length) profileUpdate.scheduled_days = scheduledDays;
  const { error: profileErr } = await supabase.from('profiles')
    .update(profileUpdate)
    .eq('user_id', userId);
  if (profileErr) throw new Error(`Profile update failed: ${profileErr.message}`);

  return totalSessions;
}
