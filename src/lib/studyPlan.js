export function getDaysUntilTest(timeframe) {
  const map = {
    'under-4-weeks': 21,
    '1-2-months': 45,
    '2-4-months': 90,
    '4-6-months': 150,
    '6-months-plus': 200,
  };
  return map[timeframe] ?? 60;
}

export function getCurrentScoreNum(currentScore) {
  const map = {
    none: null,
    'below-900': 800,
    '900-1000': 950,
    '1000-1100': 1050,
    '1100-1200': 1150,
    '1200-1300': 1250,
    '1300+': 1350,
  };
  return map[currentScore] ?? null;
}

export function getProgressPercent(currentScore, targetScore) {
  if (!currentScore) return 5;
  const min = 400;
  const pct = ((currentScore - min) / (targetScore - min)) * 100;
  return Math.min(Math.max(Math.round(pct), 5), 97);
}

export function getGreeting(language) {
  const h = new Date().getHours();
  if (language === 'ru') {
    if (h < 12) return 'Доброе утро';
    if (h < 17) return 'Добрый день';
    return 'Добрый вечер';
  }
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getWeekNumber(createdAt) {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

export function getTodaysTasks(profile, language) {
  const sections = profile.weak_sections ?? ['reading', 'math'];
  const ru = language === 'ru';
  const focusMath    = sections.includes('math');
  const focusReading = sections.includes('reading');

  const tasks = [
    {
      id: 't1',
      title: 'Khan Academy SAT',
      action: ru ? 'Пройди 2 упражнения по навыкам' : 'Complete 2 skill exercises',
      duration: '40 min',
      color: 'blue',
      url: 'https://www.khanacademy.org/sat',
    },
  ];

  if (focusMath && !focusReading) {
    tasks.push({
      id: 't2',
      title: 'College Panda Math',
      action: ru ? 'Прочитай главу 3 + задачи' : 'Read Chapter 3 + practice problems',
      duration: '35 min',
      color: 'green',
    });
    tasks.push({
      id: 't3',
      title: ru ? 'Официальный тест SAT' : 'Official SAT Practice Test',
      action: ru ? 'Пройди 1 модуль математики (на время)' : 'Complete 1 Math module (timed)',
      duration: '25 min',
      color: 'purple',
    });
  } else if (focusReading && !focusMath) {
    tasks.push({
      id: 't2',
      title: 'Erica Meltzer: Reading',
      action: ru ? 'Прочитай главу 2 + все упражнения' : 'Read Chapter 2 + all exercises',
      duration: '35 min',
      color: 'teal',
    });
    tasks.push({
      id: 't3',
      title: ru ? 'Официальный тест SAT' : 'Official SAT Practice Test',
      action: ru ? 'Пройди 1 модуль чтения (на время)' : 'Complete 1 R&W module (timed)',
      duration: '25 min',
      color: 'purple',
    });
  } else {
    tasks.push({
      id: 't2',
      title: ru ? 'Официальный тест SAT' : 'Official SAT Practice Test',
      action: ru ? 'Пройди 1 модуль математики (на время)' : 'Complete 1 Math module (timed)',
      duration: '35 min',
      color: 'green',
    });
    tasks.push({
      id: 't3',
      title: 'Erica Meltzer: Reading',
      action: ru ? 'Прочитай главу 1 + упражнения' : 'Read Chapter 1 + exercises',
      duration: '30 min',
      color: 'teal',
    });
  }

  return tasks;
}
