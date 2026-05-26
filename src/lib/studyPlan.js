export function getDaysUntilTest(timeframe, createdAt) {
  const map = {
    'under-4-weeks': 21,
    '1-2-months': 45,
    '2-4-months': 90,
    '4-6-months': 150,
    '6-months-plus': 200,
  };
  const initial = map[timeframe] ?? 60;
  if (!createdAt) return initial;
  const daysElapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(0, initial - daysElapsed);
}

export function getCurrentScoreNum(currentScore) {
  const map = {
    none: null,
    'below-900': 800,
    '900-1000': 950,
    '1000-1100': 1050,
    '1100-1200': 1150,
    '1200-1300': 1250,
    '1300-1400': 1350,
    '1400-1500': 1450,
    '1500+': 1520,
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

  // Rotate tasks by day so they change daily
  const dayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const pattern = dayIndex % 3; // 0, 1, or 2

  if (pattern === 0) {
    // Khan Academy + section-specific resource
    const tasks = [
      {
        id: 't1',
        title: 'Khan Academy SAT',
        action: ru ? 'Пройди 2 упражнения по навыкам' : 'Complete 2 skill exercises',
        duration: '40 min',
        color: 'blue',
      },
    ];
    if (focusMath) tasks.push({
      id: 't2',
      title: 'Scalar Learning',
      action: ru ? 'Посмотри 2 видео по Math' : 'Watch 2 Math concept videos',
      duration: '30 min',
      color: 'green',
    });
    if (focusReading) tasks.push({
      id: 't3',
      title: 'Dena Dickson',
      action: ru ? 'Посмотри видео по грамматике' : 'Watch a grammar video',
      duration: '25 min',
      color: 'teal',
    });
    tasks.push({
      id: 't4',
      title: ru ? 'Повтори ошибки' : 'Review mistakes',
      action: ru ? 'Разбери 5 пропущенных вопросов' : 'Go over 5 missed questions',
      duration: '20 min',
      color: 'purple',
    });
    return tasks;
  }

  if (pattern === 1) {
    // Practice test focus
    const tasks = [
      {
        id: 't1',
        title: ru ? 'Практический тест SAT' : 'SAT Practice Test',
        action: focusMath
          ? (ru ? 'Пройди 1 модуль Math (на время)' : 'Complete 1 Math module (timed)')
          : (ru ? 'Пройди 1 модуль R&W (на время)' : 'Complete 1 R&W module (timed)'),
        duration: '35 min',
        color: 'blue',
      },
      {
        id: 't2',
        title: 'Khan Academy SAT',
        action: ru ? 'Пройди 3 упражнения по навыкам' : 'Complete 3 skill exercises',
        duration: '30 min',
        color: 'green',
      },
      {
        id: 't3',
        title: ru ? 'Разбор ошибок' : 'Error Analysis',
        action: ru ? 'Объясни себе каждую ошибку вслух' : 'Explain each mistake out loud',
        duration: '20 min',
        color: 'purple',
      },
    ];
    return tasks;
  }

  // pattern === 2: Deep resource work
  const tasks = [
    {
      id: 't1',
      title: focusMath ? 'College Panda Math' : 'Erica Meltzer: Reading',
      action: focusMath
        ? (ru ? 'Прочитай главу + все задачи' : 'Read a chapter + all practice problems')
        : (ru ? 'Прочитай главу + упражнения' : 'Read a chapter + exercises'),
      duration: '45 min',
      color: 'teal',
    },
    {
      id: 't2',
      title: 'Bluebook Question Bank',
      action: ru ? 'Реши 10 вопросов по слабой теме' : 'Solve 10 questions on your weak topic',
      duration: '25 min',
      color: 'blue',
    },
    {
      id: 't3',
      title: ru ? 'Повтори материал' : 'Review session',
      action: ru ? 'Перечитай заметки за неделю' : 'Review your notes from this week',
      duration: '15 min',
      color: 'green',
    },
  ];
  return tasks;
}
