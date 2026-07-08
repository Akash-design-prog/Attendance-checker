import React, { useState } from 'react';
import { ProgressRing } from '../shared/ProgressRing';

export const WhatIfSimulator = ({ attended, held, remainingSessions }) => {
  const [simulatedSkips, setSimulatedSkips] = useState(0);

  const totalProjectedSessions = held + remainingSessions;
  const projectedAttended = Math.max(0, attended + (remainingSessions - simulatedSkips));
  
  const projectedPercentage = totalProjectedSessions > 0
    ? (projectedAttended / totalProjectedSessions) * 100
    : 100;

  const isSafe = projectedPercentage >= 75;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
      <h4 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
        <span>🔮</span> What-If Simulator
      </h4>
      <p className="text-xs text-stone-500 mb-5 leading-relaxed">
        Drag the slider to simulate how many remaining sessions you plan to skip. See where your attendance lands at semester end.
      </p>

      {remainingSessions === 0 ? (
        <div className="text-center py-4 bg-stone-100 rounded-xl border border-stone-200">
          <span className="text-xs text-stone-500 font-medium">Semester has ended. No sessions remaining to simulate.</span>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-stone-50 border border-stone-200 p-4 rounded-xl">
            {/* Projected Ring indicator */}
            <div className="flex items-center gap-4">
              <ProgressRing percentage={projectedPercentage} size={64} strokeWidth={5.5} />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  Projected End-Pct
                </span>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-stone-800 leading-tight">
                    {projectedPercentage.toFixed(1)}%
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isSafe ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {isSafe ? 'Safe' : 'Debarred'}
                  </span>
                </div>
              </div>
            </div>

            {/* Counts breakdown */}
            <div className="text-xs text-stone-500 flex flex-col gap-1 sm:text-right">
              <div>
                Projected Attended: <strong className="text-stone-700">{projectedAttended}</strong>/{totalProjectedSessions} classes
              </div>
              <div>
                Simulated skips: <strong className="text-amber-600">{simulatedSkips}</strong>/{remainingSessions} sessions
              </div>
            </div>
          </div>

          {/* Slider input */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-stone-500 font-medium">
              <span>Skip 0 classes</span>
              <span>Skip {remainingSessions} classes</span>
            </div>
            <input
              type="range"
              id="slider-what-if"
              min="0"
              max={remainingSessions}
              value={simulatedSkips}
              onChange={(e) => setSimulatedSkips(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
            />
            <div className="text-center">
              <span className="inline-block text-xs font-bold bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full mt-2">
                Simulating {simulatedSkips} skipped sessions
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
