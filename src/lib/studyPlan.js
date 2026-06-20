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


const DAY_NAMES_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_NAMES_RU = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
export const DAY_SHORT_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const DAY_SHORT_RU = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];

// Parse 'YYYY-MM-DD' as LOCAL midnight (not UTC) to avoid timezone day-shift bugs
export function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Return today's date as 'YYYY-MM-DD' in local time
export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// Format a local Date as 'YYYY-MM-DD'
function toLocalStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function countSessionsUpTo(date, planStartDate, scheduledDays) {
  const target = new Date(date); target.setHours(0,0,0,0);
  const start = new Date(planStartDate); start.setHours(0,0,0,0);
  let count = 0;
  const cur = new Date(start);
  while (cur <= target) {
    if (scheduledDays.includes(cur.getDay())) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export function getTodaySessionNumber(planStartDate, scheduledDays) {
  if (!planStartDate) return 1;
  if (!scheduledDays?.length) {
    const start = parseLocalDate(planStartDate);
    return Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1);
  }
  const today = new Date(); today.setHours(0,0,0,0);
  if (!scheduledDays.includes(today.getDay())) return null;
  return countSessionsUpTo(today, parseLocalDate(planStartDate), scheduledDays);
}

export function getSessionNumForDate(dateStr, planStartDate, scheduledDays) {
  if (!planStartDate || !scheduledDays?.length) return null;
  const date = parseLocalDate(dateStr);
  const start = parseLocalDate(planStartDate);
  if (date < start) return null;
  if (!scheduledDays.includes(date.getDay())) return null;
  return countSessionsUpTo(date, start, scheduledDays);
}

export function getLastSessionDate(planStartDate, scheduledDays) {
  if (!scheduledDays?.length) return localToday();
  const today = new Date(); today.setHours(0,0,0,0);
  const start = planStartDate ? parseLocalDate(planStartDate) : today;
  const cur = new Date(today);
  while (cur >= start) {
    if (scheduledDays.includes(cur.getDay())) return toLocalStr(cur);
    cur.setDate(cur.getDate() - 1);
  }
  return null;
}

export function getPrevSessionDate(planStartDate, scheduledDays, referenceDate) {
  if (!scheduledDays?.length) return null;
  const ref = referenceDate ? parseLocalDate(referenceDate) : new Date();
  ref.setHours(0,0,0,0);
  ref.setDate(ref.getDate() - 1);
  const start = parseLocalDate(planStartDate); start.setHours(0,0,0,0);
  while (ref >= start) {
    if (scheduledDays.includes(ref.getDay())) return toLocalStr(ref);
    ref.setDate(ref.getDate() - 1);
  }
  return null;
}

export function getNextSessionDayName(scheduledDays, language) {
  if (!scheduledDays?.length) return null;
  const cur = new Date();
  cur.setDate(cur.getDate() + 1);
  for (let i = 0; i < 7; i++) {
    if (scheduledDays.includes(cur.getDay())) {
      return language === 'ru' ? DAY_NAMES_RU[cur.getDay()] : DAY_NAMES_EN[cur.getDay()];
    }
    cur.setDate(cur.getDate() + 1);
  }
  return null;
}

export function getWeekCalendar(planStartDate, scheduledDays) {
  const todayStr = localToday();
  const monday = new Date();
  const dow = monday.getDay() || 7;
  monday.setDate(monday.getDate() - dow + 1);
  monday.setHours(0,0,0,0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const dateStr = toLocalStr(d);
    const sessionNum = scheduledDays?.length
      ? getSessionNumForDate(dateStr, planStartDate, scheduledDays)
      : null;
    return {
      date: dateStr,
      weekday: d.getDay(),
      sessionNum,
      isToday: dateStr === todayStr,
      isSessionDay: scheduledDays?.length ? scheduledDays.includes(d.getDay()) : true,
      isFuture: dateStr > todayStr,
    };
  });
}
