import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const CONFETTI_COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'];
const BURST_PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 14 + 0.35;
  const distance = 30 + (i % 4) * 11;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance - 12,
    rotate: ((i * 47) % 180) - 90,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    width: 5 + (i % 3) * 2,
    delay: (i % 5) * 0.04,
  };
});

/** One quiet burst when a new personal record lands. Plays once per day. */
const RecordBurst: React.FC = () => (
  <span className="pointer-events-none absolute -inset-3 z-10" aria-hidden="true">
    {BURST_PARTICLES.map((particle, index) => (
      <motion.span
        key={index}
        className="absolute left-1/2 top-1/2 rounded-[1px]"
        style={{ width: particle.width, height: particle.width * 0.6, backgroundColor: particle.color }}
        initial={{ x: 0, y: 0, opacity: 0.95, rotate: 0 }}
        animate={{ x: particle.x, y: particle.y, opacity: 0, rotate: particle.rotate }}
        transition={{ duration: 0.95, delay: particle.delay, ease: 'easeOut' }}
      />
    ))}
  </span>
);

/** The task-record comparison line — everyone races their own best, no fixed limits. */
export const TaskRecordLine: React.FC<{
  viewingToday: boolean;
  activityCount: number;
  taskBest: number;
  prevTaskBest: number;
  isNewRecord: boolean;
  burstPlaying: boolean;
}> = ({ viewingToday, activityCount, taskBest, prevTaskBest, isNewRecord, burstPlaying }) => {
  if (!viewingToday) {
    return (
      <span className="tabular-nums">
        {activityCount} {activityCount === 1 ? 'task' : 'tasks'}
        {taskBest > 0 ? ` · personal best ${taskBest}` : ''}
      </span>
    );
  }
  if (isNewRecord) {
    return (
      <span className="relative inline-flex items-center gap-1.5 font-bold text-foreground">
        {burstPlaying && <RecordBurst />}
        <Trophy className="size-3.5 text-amber-500" aria-hidden="true" />
        New personal record · {activityCount} tasks today
      </span>
    );
  }
  if (activityCount === 0) {
    return prevTaskBest > 0 ? (
      <span className="tabular-nums">0 tasks today · best {prevTaskBest}</span>
    ) : null;
  }
  if (activityCount === prevTaskBest) {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
        <Trophy className="size-3.5 text-amber-500" aria-hidden="true" />
        Matched your best · {activityCount} tasks today
      </span>
    );
  }
  if (prevTaskBest > 0) {
    return (
      <span className="tabular-nums">
        {activityCount} tasks today · {prevTaskBest - activityCount} away from your best ({prevTaskBest})
      </span>
    );
  }
  return <span className="tabular-nums">{activityCount} tasks today · your personal best</span>;
};
