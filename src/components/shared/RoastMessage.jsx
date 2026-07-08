import React, { useMemo } from 'react';

const ROASTS = {
  nodata: [
    "No logs yet. The quiet before the storm.",
    "Data empty. Just like your classroom chair?",
  ],
  high: [
    "Overachiever alert! Do you sleep in the front row?",
    "90%+ attendance? Your HOD probably knows your pet's name.",
    "Teacher's favorite. Leave some marks for the rest of us.",
  ],
  safe: [
    "Solid compliance. You can breathe easy.",
    "Safe and sound. Not too nerdy, not too risky.",
    "Looking clean. The dean doesn't even know you exist (which is good).",
  ],
  close: [
    "Walking on thin ice. One oversleep and you're cooked.",
    "75% border patrol. Keep your eyes on the clock.",
    "Living life on the edge, literally. No more skips allowed.",
  ],
  danger: [
    "Danger Zone! Time to start coughing convincingly.",
    "Bunk index critical. Start researching HOD medical certificate rules.",
    "Below 75%. The college portal is preparing its auto-debar warning.",
    "You are currently legally a ghost to your department.",
  ]
};

export const RoastMessage = ({ percentage }) => {
  const message = useMemo(() => {
    if (percentage === null || percentage === undefined) return ROASTS.nodata[Math.floor(Math.random() * ROASTS.nodata.length)];
    if (percentage >= 85) return ROASTS.high[Math.floor(Math.random() * ROASTS.high.length)];
    if (percentage >= 80) return ROASTS.safe[Math.floor(Math.random() * ROASTS.safe.length)];
    if (percentage >= 75) return ROASTS.close[Math.floor(Math.random() * ROASTS.close.length)];
    return ROASTS.danger[Math.floor(Math.random() * ROASTS.danger.length)];
  }, [percentage]);

  let textColor = 'text-stone-400';
  if (percentage !== null && percentage !== undefined) {
    if (percentage >= 80) textColor = 'text-emerald-600/80';
    else if (percentage >= 75) textColor = 'text-amber-600/80';
    else textColor = 'text-rose-500/80';
  }

  return (
    <p className={`text-xs italic font-medium mt-2 leading-relaxed ${textColor}`}>
      &ldquo;{message}&rdquo;
    </p>
  );
};
