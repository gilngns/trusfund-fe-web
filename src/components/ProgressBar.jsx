import { useState, useEffect } from 'react';

export default function ProgressBar({ progress }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner relative">
      <div 
        className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] relative overflow-hidden" 
        style={{ width: `${width}%` }}
      >
        <div 
          className="absolute top-0 bottom-0 w-[30px] bg-white/30"
          style={{ animation: 'shimmer 2.5s infinite linear' }}
        ></div>
      </div>
    </div>
  );
}
