import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { supabase } from '../lib/supabase';
import { getCurrentScoreNum, getDaysUntilTest } from '../lib/studyPlan';

function Progress({ user, profile, language, setCurrentPage }) {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);

  const ru = language === 'ru';

  const startScore  = profile.current_score_actual ?? getCurrentScoreNum(profile.current_score) ?? 800;
  const targetScore = profile.target_score ?? 1400;
  const daysLeft    = getDaysUntilTest(profile.exam_timeframe, profile.created_at);
  const streak      = profile.current_streak ?? 0;
  const longestStreak = profile.longest_streak ?? 0;

  useEffect(() => {
    supabase
      .from('user_tasks')
      .select('day_number, completed, duration_minutes, created_at')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setTasks(data ?? []);
        setLoading(false);
      });
  }, [user.id]);

  if (loading) {
    return (
      <div className="progress-page">
        <div className="progress-loading">
          <div className="chat-typing"><span/><span/><span/></div>
        </div>
      </div>
    );
  }

  if (!profile.plan_created || tasks.length === 0) {
    return (
      <div className="progress-page">
        <div className="progress-empty">
          <div className="progress-empty__icon">📊</div>
          <h2>{ru ? 'Прогресс появится здесь' : 'Your progress will appear here'}</h2>
          <p>{ru ? 'Сначала создай план подготовки с AI Buddy' : 'First, build a study plan with AI Buddy'}</p>
          <button className="dashboard-empty__btn" onClick={() => setCurrentPage('ai-buddy')}>
            {ru ? 'Создать план →' : 'Create my plan →'}
          </button>
        </div>
      </div>
    );
  }

  const totalTasks     = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const estimatedScore = Math.round(startScore + (targetScore - startScore) * completionRate);
  const hoursStudied   = tasks
    .filter(t => t.completed)
    .reduce((sum, t) => sum + (t.duration_minutes || 30), 0) / 60;

  // Build weekly chart data
  const planStartDate = profile.plan_start_date ? new Date(profile.plan_start_date) : new Date();
  const weeklyData = buildWeeklyData(tasks, planStartDate, startScore, targetScore);

  // Current week stats
  const today = new Date();
  const dayNum = Math.max(1, Math.floor((today - planStartDate) / 86400000) + 1);
  const weekStart = dayNum - ((dayNum - 1) % 7);
  const weekEnd   = weekStart + 6;
  const thisWeekTasks     = tasks.filter(t => t.day_number >= weekStart && t.day_number <= weekEnd);
  const thisWeekCompleted = thisWeekTasks.filter(t => t.completed).length;
  const thisWeekHours     = thisWeekTasks
    .filter(t => t.completed)
    .reduce((sum, t) => sum + (t.duration_minutes || 30), 0) / 60;

  const planPct = Math.round(completionRate * 100);

  const stats = [
    { icon: '✅', value: completedTasks, label: ru ? 'Задач выполнено' : 'Tasks completed' },
    { icon: '⏱️', value: `${hoursStudied.toFixed(1)}h`, label: ru ? 'Часов подготовки' : 'Hours studied' },
    { icon: '🔥', value: streak, label: ru ? 'Дней подряд' : 'Day streak' },
    { icon: '📅', value: daysLeft, label: ru ? 'Дней до теста' : 'Days to test' },
  ];

  return (
    <div className="progress-page">
      <div className="progress-inner">

        {/* Header */}
        <div className="progress-header">
          <h1 className="progress-header__title">{ru ? 'Мой прогресс' : 'My Progress'}</h1>
          <p className="progress-header__sub">
            {ru ? `${planPct}% плана выполнено` : `${planPct}% of plan complete`}
          </p>
        </div>

        {/* Stats row */}
        <div className="progress-stats">
          {stats.map((s, i) => (
            <div key={i} className="progress-stat">
              <span className="progress-stat__icon">{s.icon}</span>
              <span className="progress-stat__value">{s.value}</span>
              <span className="progress-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Score chart */}
        <div className="progress-card">
          <div className="progress-card__header">
            <h2 className="progress-card__title">{ru ? 'Прогноз балла' : 'Score Forecast'}</h2>
            <div className="progress-score-chips">
              <span className="chip chip--start">{ru ? 'Старт' : 'Start'}: {startScore}</span>
              <span className="chip chip--now">{ru ? 'Сейчас' : 'Now'}: ~{estimatedScore}</span>
              <span className="chip chip--target">{ru ? 'Цель' : 'Target'}: {targetScore}</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[Math.max(400, startScore - 50), Math.min(1600, targetScore + 50)]}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}
                formatter={(val) => [`${val}`, ru ? 'Прогноз' : 'Estimate']}
              />
              <ReferenceLine y={targetScore} stroke="#10b981" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: ru ? 'Цель' : 'Target', fill: '#10b981', fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#scoreGrad)"
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* This week summary */}
        <div className="progress-card">
          <h2 className="progress-card__title">{ru ? 'Эта неделя' : 'This Week'}</h2>
          <div className="week-summary">
            <div className="week-summary__item">
              <span className="week-summary__num">{thisWeekCompleted}</span>
              <span className="week-summary__label">{ru ? 'задач выполнено' : 'tasks done'}</span>
            </div>
            <div className="week-summary__divider" />
            <div className="week-summary__item">
              <span className="week-summary__num">{thisWeekHours.toFixed(1)}h</span>
              <span className="week-summary__label">{ru ? 'часов подготовки' : 'hours studied'}</span>
            </div>
            <div className="week-summary__divider" />
            <div className="week-summary__item">
              <span className="week-summary__num">{thisWeekTasks.length > 0 ? Math.round((thisWeekCompleted / thisWeekTasks.length) * 100) : 0}%</span>
              <span className="week-summary__label">{ru ? 'выполнено' : 'completion'}</span>
            </div>
          </div>
        </div>

        {/* Streak card */}
        <div className="progress-card progress-streak-card">
          <div className="progress-streak">
            <div className="progress-streak__item">
              <span className="progress-streak__fire">🔥</span>
              <span className="progress-streak__num">{streak}</span>
              <span className="progress-streak__label">{ru ? 'текущий streak' : 'current streak'}</span>
            </div>
            <div className="progress-streak__divider" />
            <div className="progress-streak__item">
              <span className="progress-streak__fire">🏆</span>
              <span className="progress-streak__num">{longestStreak}</span>
              <span className="progress-streak__label">{ru ? 'рекорд' : 'best streak'}</span>
            </div>
          </div>
          {streak === 0 && (
            <p className="progress-streak__msg">
              {ru ? 'Выполни задачу сегодня чтобы начать streak!' : 'Complete a task today to start your streak!'}
            </p>
          )}
          {streak > 0 && streak >= longestStreak && (
            <p className="progress-streak__msg progress-streak__msg--good">
              {ru ? '🎉 Это твой рекорд!' : '🎉 This is your personal best!'}
            </p>
          )}
        </div>

        {/* Back to dashboard */}
        <div style={{ textAlign: 'center', paddingBottom: 32 }}>
          <button className="dash-rebuild-btn" onClick={() => setCurrentPage('dashboard')}>
            {ru ? '← Вернуться на Dashboard' : '← Back to Dashboard'}
          </button>
        </div>

      </div>
    </div>
  );
}

function buildWeeklyData(tasks, planStartDate, startScore, targetScore) {
  if (!tasks.length) return [{ label: 'Week 1', score: startScore }];

  const maxDay = Math.max(...tasks.map(t => t.day_number));
  const totalWeeks = Math.ceil(maxDay / 7);
  const totalTasks = tasks.length;

  const data = [{ label: 'Start', score: startScore }];

  let cumulativeCompleted = 0;
  for (let w = 1; w <= Math.min(totalWeeks, 20); w++) {
    const weekStart = (w - 1) * 7 + 1;
    const weekEnd   = w * 7;
    const weekCompleted = tasks.filter(t => t.day_number >= weekStart && t.day_number <= weekEnd && t.completed).length;
    cumulativeCompleted += weekCompleted;
    const rate  = cumulativeCompleted / totalTasks;
    const score = Math.round(startScore + (targetScore - startScore) * rate);
    data.push({ label: `W${w}`, score });
  }

  return data;
}

export default Progress;
