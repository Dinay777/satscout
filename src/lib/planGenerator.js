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
    { title: 'Practice: Linear equations', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 30 },
    { title: 'Watch: Problem-solving strategies', task_type: 'video', resource_name: 'SAT Math Ninja', resource_url: 'https://www.youtube.com/@SATMathNinja', duration_minutes: 20 },
    { title: 'Practice: Ratios & proportions', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 30 },
    { title: 'Watch: Systems of equations', task_type: 'video', resource_name: 'Scalar Learning', resource_url: 'https://www.youtube.com/@ScalarLearning', duration_minutes: 25 },
    { title: 'Practice: Quadratic equations', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
  ],
  core: [
    { title: 'Read: Algebra chapter + problems', task_type: 'read', resource_name: 'College Panda Math', resource_url: 'https://thecollegepanda.com/books/', duration_minutes: 40 },
    { title: 'Watch: Advanced Math patterns', task_type: 'video', resource_name: 'SAT Quantum', resource_url: 'https://www.youtube.com/@SATQuantum', duration_minutes: 25 },
    { title: 'Practice: 10 Bluebook questions', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 35 },
    { title: 'Read: Statistics & Data chapter', task_type: 'read', resource_name: 'College Panda Math', resource_url: 'https://thecollegepanda.com/books/', duration_minutes: 40 },
    { title: 'Watch: Geometry & Trigonometry', task_type: 'video', resource_name: 'Scalar Learning', resource_url: 'https://www.youtube.com/@ScalarLearning', duration_minutes: 25 },
    { title: 'Practice: Timed 10-question set', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 20 },
  ],
  testprep: [
    { title: 'Practice: Full Math Module 1 (timed)', task_type: 'practice', resource_name: 'Bluebook App', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 35 },
    { title: 'Review: Analyze all mistakes', task_type: 'read', resource_name: 'Your notes', resource_url: null, duration_minutes: 20 },
    { title: 'Practice: Full Math Module 2 (timed)', task_type: 'practice', resource_name: 'Bluebook App', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 35 },
    { title: 'Watch: Test-taking strategies', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@SupertutorTV', duration_minutes: 20 },
    { title: 'Practice: Ivy Global Math section', task_type: 'practice', resource_name: 'Ivy Global Practice Tests', resource_url: 'https://ivyglobal.com/study/digital-sat', duration_minutes: 40 },
  ],
};

const READING_TASKS = {
  foundation: [
    { title: 'Watch: SAT R&W question types', task_type: 'video', resource_name: "Mark's SAT Prep", resource_url: 'https://www.youtube.com/@MarksSATPrep', duration_minutes: 20 },
    { title: 'Practice: Grammar exercises', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 30 },
    { title: 'Watch: Standard English Conventions', task_type: 'video', resource_name: 'Dena Dickson', resource_url: 'https://www.youtube.com/@DenaDickson', duration_minutes: 20 },
    { title: 'Practice: Craft & Structure questions', task_type: 'practice', resource_name: 'Khan Academy SAT', resource_url: 'https://www.khanacademy.org/sat', duration_minutes: 30 },
    { title: 'Watch: Reading comprehension strategies', task_type: 'video', resource_name: "Mark's SAT Prep", resource_url: 'https://www.youtube.com/@MarksSATPrep', duration_minutes: 25 },
    { title: 'Practice: 10 R&W questions', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
  ],
  core: [
    { title: 'Read: Grammar rules chapter', task_type: 'read', resource_name: 'Erica Meltzer Grammar', resource_url: 'https://thecriticalreader.com/books/', duration_minutes: 40 },
    { title: 'Watch: Transitions & rhetoric', task_type: 'video', resource_name: 'Dena Dickson', resource_url: 'https://www.youtube.com/@DenaDickson', duration_minutes: 20 },
    { title: 'Practice: 15 R&W Bluebook questions', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 30 },
    { title: 'Read: Reading comprehension chapter', task_type: 'read', resource_name: 'Erica Meltzer Critical Reader', resource_url: 'https://thecriticalreader.com', duration_minutes: 40 },
    { title: 'Watch: Vocabulary in context', task_type: 'video', resource_name: "Mark's SAT Prep", resource_url: 'https://www.youtube.com/@MarksSATPrep', duration_minutes: 20 },
    { title: 'Practice: Timed grammar set', task_type: 'practice', resource_name: 'Bluebook Question Bank', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 25 },
  ],
  testprep: [
    { title: 'Practice: Full R&W Module 1 (timed)', task_type: 'practice', resource_name: 'Bluebook App', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 32 },
    { title: 'Review: Analyze all R&W mistakes', task_type: 'read', resource_name: 'Your notes', resource_url: null, duration_minutes: 20 },
    { title: 'Practice: Full R&W Module 2 (timed)', task_type: 'practice', resource_name: 'Bluebook App', resource_url: 'https://bluebook.collegeboard.org', duration_minutes: 32 },
    { title: 'Watch: Final strategy overview', task_type: 'video', resource_name: 'SupertutorTV', resource_url: 'https://www.youtube.com/@SupertutorTV', duration_minutes: 20 },
    { title: 'Practice: Ivy Global R&W section', task_type: 'practice', resource_name: 'Ivy Global Practice Tests', resource_url: 'https://ivyglobal.com/study/digital-sat', duration_minutes: 32 },
  ],
};

function getPhase(dayNumber, totalDays) {
  const pct = dayNumber / totalDays;
  if (pct < 0.35) return 'foundation';
  if (pct < 0.75) return 'core';
  return 'testprep';
}

export async function generateAndSavePlan(profile, userId) {
  const totalDays = TIMEFRAME_DAYS[profile.exam_timeframe] ?? 60;
  const tasksPerDay = TASKS_PER_DAY[profile.study_hours] ?? 2;
  const sections = profile.weak_sections ?? ['math', 'reading'];
  const focusMath = sections.includes('math');
  const focusReading = sections.includes('reading');

  await supabase.from('user_tasks').delete().eq('user_id', userId);

  const allTasks = [];
  const idx = { math: { foundation: 0, core: 0, testprep: 0 }, reading: { foundation: 0, core: 0, testprep: 0 } };

  for (let day = 1; day <= totalDays; day++) {
    const phase = getPhase(day, totalDays);
    const dayTasks = [];

    if (focusMath && focusReading) {
      const mp = MATH_TASKS[phase];
      const rp = READING_TASKS[phase];
      dayTasks.push(mp[idx.math[phase] % mp.length]);
      idx.math[phase]++;
      dayTasks.push(rp[idx.reading[phase] % rp.length]);
      idx.reading[phase]++;
      if (tasksPerDay >= 3) {
        const extra = day % 2 === 0 ? mp[idx.math[phase] % mp.length] : rp[idx.reading[phase] % rp.length];
        if (day % 2 === 0) idx.math[phase]++; else idx.reading[phase]++;
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
        day_number: day,
        task_title: task.title,
        task_type: task.task_type,
        resource_name: task.resource_name,
        resource_url: task.resource_url,
        duration_minutes: task.duration_minutes,
        completed: false,
      });
    }
  }

  console.log('[Plan] Total tasks to insert:', allTasks.length, '| userId:', userId);

  for (let i = 0; i < allTasks.length; i += 100) {
    const { error } = await supabase.from('user_tasks').insert(allTasks.slice(i, i + 100));
    if (error) console.error('[Plan] Insert error batch', i, error);
    else console.log('[Plan] Inserted batch', i, '-', Math.min(i + 100, allTasks.length));
  }

  const today = new Date().toISOString().slice(0, 10);
  const { error: profileErr } = await supabase.from('profiles')
    .update({ plan_start_date: today, plan_created: true })
    .eq('user_id', userId);
  if (profileErr) console.error('[Plan] Profile update error:', profileErr);
  else console.log('[Plan] plan_start_date set to', today);

  return totalDays;
}
