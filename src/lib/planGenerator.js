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

const MATH_TASKS = {
  foundation: [
    { title: 'Watch: Heart of Algebra overview', task_type: 'video', resource_name: 'Scalar Learning', resource_url: 'https://www.youtube.com/@ScalarLearning', duration_minutes: 20 },
    { title: 'Practice: Linear equations (10 questions)', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 30 },
    { title: 'Watch: Problem-solving strategies for SAT', task_type: 'video', resource_name: 'SAT Math Ninja', resource_url: 'https://www.youtube.com/@SATMathNinja', duration_minutes: 20 },
    { title: 'Practice: Ratios & proportions', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 30 },
    { title: 'Watch: Systems of equations explained', task_type: 'video', resource_name: 'Scalar Learning', resource_url: 'https://www.youtube.com/@ScalarLearning', duration_minutes: 25 },
    { title: 'Practice: Quadratic equations drill', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Watch: Percentages & word problems', task_type: 'video', resource_name: 'SAT Math Ninja', resource_url: 'https://www.youtube.com/@SATMathNinja', duration_minutes: 20 },
    { title: 'Practice: Inequalities & number line', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 25 },
    { title: 'Watch: Functions — input/output basics', task_type: 'video', resource_name: 'SAT Quantum', resource_url: 'https://www.youtube.com/@SATQuantum', duration_minutes: 20 },
    { title: 'Practice: Word problems — translating to equations', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 30 },
    { title: 'Watch: Exponents & roots fundamentals', task_type: 'video', resource_name: 'Scalar Learning', resource_url: 'https://www.youtube.com/@ScalarLearning', duration_minutes: 20 },
    { title: 'Practice: 8 Bluebook foundation questions', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 25 },
    { title: 'Watch: Reading graphs & tables', task_type: 'video', resource_name: 'SAT Math Ninja', resource_url: 'https://www.youtube.com/@SATMathNinja', duration_minutes: 15 },
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
    { title: 'Watch: Exam-day strategy & time management', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@SupertutorTV', duration_minutes: 20 },
    { title: 'Practice: Ivy Global Math section (timed)', task_type: 'practice', resource_name: 'Ivy Global Practice Tests', resource_url: 'https://ivyglobal.com/study/digital-sat', duration_minutes: 40 },
    { title: 'Review: Weak topic targeted drill', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Watch: Hard question techniques (700+ level)', task_type: 'video', resource_name: 'SAT Quantum', resource_url: 'https://www.youtube.com/@SATQuantum', duration_minutes: 25 },
    { title: 'Practice: 20-question mixed timed set', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Review: Full practice test error log', task_type: 'read', resource_name: 'Your notes', resource_url: null, duration_minutes: 25 },
  ],
};

const READING_TASKS = {
  foundation: [
    { title: 'Watch: SAT R&W question types overview', task_type: 'video', resource_name: "Mark's SAT Prep", resource_url: 'https://www.youtube.com/@MarksSATPrep', duration_minutes: 20 },
    { title: 'Practice: Grammar exercises — basics', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 30 },
    { title: 'Watch: Standard English Conventions rules', task_type: 'video', resource_name: 'Dena Dickson', resource_url: 'https://www.youtube.com/@DenaDickson', duration_minutes: 20 },
    { title: 'Practice: Craft & Structure questions (8 q)', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 30 },
    { title: 'Watch: Reading comprehension — main idea & purpose', task_type: 'video', resource_name: "Mark's SAT Prep", resource_url: 'https://www.youtube.com/@MarksSATPrep', duration_minutes: 25 },
    { title: 'Practice: 10 R&W Bluebook questions', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Watch: Punctuation rules — commas & semicolons', task_type: 'video', resource_name: 'Dena Dickson', resource_url: 'https://www.youtube.com/@DenaDickson', duration_minutes: 20 },
    { title: 'Practice: Subject-verb agreement drill', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 25 },
    { title: 'Watch: Inference & evidence questions', task_type: 'video', resource_name: "Mark's SAT Prep", resource_url: 'https://www.youtube.com/@MarksSATPrep', duration_minutes: 20 },
    { title: 'Practice: Pronoun & modifier questions', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 25 },
    { title: 'Watch: Rhetorical purpose question type', task_type: 'video', resource_name: "Mark's SAT Prep", resource_url: 'https://www.youtube.com/@MarksSATPrep', duration_minutes: 15 },
    { title: 'Practice: 8 Bluebook R&W mixed questions', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 25 },
    { title: 'Watch: Vocabulary in context strategies', task_type: 'video', resource_name: 'Dena Dickson', resource_url: 'https://www.youtube.com/@DenaDickson', duration_minutes: 20 },
    { title: 'Practice: Sentence completion & clarity', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 25 },
  ],
  core: [
    { title: 'Read: Grammar rules — chapters 1-3', task_type: 'read', resource_name: 'Erica Meltzer Grammar', resource_url: 'https://thecriticalreader.com/books/', duration_minutes: 40 },
    { title: 'Watch: Transitions & logical connectors', task_type: 'video', resource_name: 'Dena Dickson', resource_url: 'https://www.youtube.com/@DenaDickson', duration_minutes: 20 },
    { title: 'Practice: 15 R&W Bluebook questions (mixed)', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Read: Reading comprehension — chapter 1', task_type: 'read', resource_name: 'Erica Meltzer Critical Reader', resource_url: 'https://thecriticalreader.com', duration_minutes: 40 },
    { title: 'Watch: Vocabulary in context — advanced', task_type: 'video', resource_name: "Mark's SAT Prep", resource_url: 'https://www.youtube.com/@MarksSATPrep', duration_minutes: 20 },
    { title: 'Practice: Timed grammar set (20 min)', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 25 },
    { title: 'Read: Rhetorical analysis — chapter 2', task_type: 'read', resource_name: 'Erica Meltzer Critical Reader', resource_url: 'https://thecriticalreader.com', duration_minutes: 35 },
    { title: 'Watch: Cross-text questions strategy', task_type: 'video', resource_name: 'Dena Dickson', resource_url: 'https://www.youtube.com/@DenaDickson', duration_minutes: 20 },
    { title: 'Practice: Evidence-based reading questions', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Read: Sentence structure & parallel construction', task_type: 'read', resource_name: 'Erica Meltzer Grammar', resource_url: 'https://thecriticalreader.com/books/', duration_minutes: 30 },
    { title: 'Watch: Passage structure & author\'s purpose', task_type: 'video', resource_name: "Mark's SAT Prep", resource_url: 'https://www.youtube.com/@MarksSATPrep', duration_minutes: 20 },
    { title: 'Practice: Inference & command of evidence', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Watch: Notes-based questions (new SAT format)', task_type: 'video', resource_name: 'Dena Dickson', resource_url: 'https://www.youtube.com/@DenaDickson', duration_minutes: 20 },
    { title: 'Practice: Boundaries & sentence construction', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 25 },
  ],
  testprep: [
    { title: 'Practice: Full R&W Module 1 timed (32 min)', task_type: 'practice', resource_name: 'Bluebook App', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 32 },
    { title: 'Review: Categorize all R&W mistakes by type', task_type: 'read', resource_name: 'Your notes', resource_url: null, duration_minutes: 20 },
    { title: 'Practice: Full R&W Module 2 timed (32 min)', task_type: 'practice', resource_name: 'Bluebook App', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 32 },
    { title: 'Watch: Final strategy — what to do in last 5 min', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@SupertutorTV', duration_minutes: 20 },
    { title: 'Practice: Ivy Global R&W section (timed)', task_type: 'practice', resource_name: 'Ivy Global Practice Tests', resource_url: 'https://ivyglobal.com/study/digital-sat', duration_minutes: 32 },
    { title: 'Review: Targeted drill on weakest R&W category', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 25 },
    { title: 'Watch: High-difficulty R&W question walkthrough', task_type: 'video', resource_name: "Mark's SAT Prep", resource_url: 'https://www.youtube.com/@MarksSATPrep', duration_minutes: 20 },
    { title: 'Practice: 20-question timed mixed R&W set', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 28 },
    { title: 'Review: Error log — patterns & frequency', task_type: 'read', resource_name: 'Your notes', resource_url: null, duration_minutes: 20 },
  ],
};

function getPhase(dayNumber, totalDays) {
  const pct = dayNumber / totalDays;
  if (pct < 0.35) return 'foundation';
  if (pct < 0.75) return 'core';
  return 'testprep';
}

export async function generateAndSavePlan(profile, userId, aiTasks = null, scheduledDays = null) {
  const totalDays = TIMEFRAME_DAYS[profile.exam_timeframe] ?? 60;
  const tasksPerDay = TASKS_PER_DAY[profile.study_hours] ?? 2;
  const sections = profile.weak_sections ?? ['math', 'reading'];
  const focusMath = sections.includes('math');
  const focusReading = sections.includes('reading');

  const sessionsPerWeek = scheduledDays?.length || 7;
  const totalSessions = scheduledDays?.length
    ? Math.ceil(totalDays / 7 * sessionsPerWeek)
    : totalDays;

  await supabase.from('user_tasks').delete().eq('user_id', userId);

  const allTasks = [];

  if (aiTasks?.length) {
    // Build template: group by day field, use only days 1..sessionsPerWeek
    const templateDays = [...new Set(aiTasks.map(t => t.day))].sort((a, b) => a - b);
    const usedDays = templateDays.slice(0, sessionsPerWeek);
    const tasksPerTemplateDay = {};
    for (const d of usedDays) {
      tasksPerTemplateDay[d] = aiTasks.filter(t => t.day === d);
    }
    const templateLength = usedDays.length || 1;

    for (let session = 1; session <= totalSessions; session++) {
      const templateDay = usedDays[(session - 1) % templateLength];
      const dayTaskTemplates = tasksPerTemplateDay[templateDay] ?? [];
      for (const t of dayTaskTemplates) {
        allTasks.push({
          user_id: userId,
          day_number: session,
          task_title: t.title,
          task_type: t.task_type,
          resource_name: t.resource_name,
          resource_url: t.resource_url ?? null,
          duration_minutes: t.duration_minutes ?? 30,
          completed: false,
        });
      }
    }
  } else {
    const idx = { math: { foundation: 0, core: 0, testprep: 0 }, reading: { foundation: 0, core: 0, testprep: 0 } };

    for (let session = 1; session <= totalSessions; session++) {
      const phase = getPhase(session, totalSessions);
      const dayTasks = [];

      if (focusMath && focusReading) {
        const mp = MATH_TASKS[phase];
        const rp = READING_TASKS[phase];
        dayTasks.push(mp[idx.math[phase] % mp.length]);
        idx.math[phase]++;
        dayTasks.push(rp[idx.reading[phase] % rp.length]);
        idx.reading[phase]++;
        if (tasksPerDay >= 3) {
          const extra = session % 2 === 0 ? mp[idx.math[phase] % mp.length] : rp[idx.reading[phase] % rp.length];
          if (session % 2 === 0) idx.math[phase]++; else idx.reading[phase]++;
          dayTasks.push(extra);
        }
      } else if (focusMath) {
        const pool = MATH_TASKS[phase];
        for (let i = 0; i < tasksPerDay; i++) {
          dayTasks.push(pool[(idx.math[phase] + i) % pool.length]);
        }
        idx.math[phase] += tasksPerDay;
      } else {
        const pool = READING_TASKS[phase];
        for (let i = 0; i < tasksPerDay; i++) {
          dayTasks.push(pool[(idx.reading[phase] + i) % pool.length]);
        }
        idx.reading[phase] += tasksPerDay;
      }

      for (const task of dayTasks) {
        allTasks.push({
          user_id: userId,
          day_number: session,
          task_title: task.title,
          task_type: task.task_type,
          resource_name: task.resource_name,
          resource_url: task.resource_url,
          duration_minutes: task.duration_minutes,
          completed: false,
        });
      }
    }
  }

  if (allTasks.length === 0) throw new Error('No tasks generated — check profile fields');

  for (let i = 0; i < allTasks.length; i += 100) {
    const { error } = await supabase.from('user_tasks').insert(allTasks.slice(i, i + 100));
    if (error) throw new Error(`Insert failed: ${error.message} (code: ${error.code})`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const profileUpdate = { plan_start_date: today, plan_created: true };
  if (scheduledDays?.length) profileUpdate.scheduled_days = scheduledDays;
  const { error: profileErr } = await supabase.from('profiles')
    .update(profileUpdate)
    .eq('user_id', userId);
  if (profileErr) throw new Error(`Profile update failed: ${profileErr.message}`);

  return totalSessions;
}
