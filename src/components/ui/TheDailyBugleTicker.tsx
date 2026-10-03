'use client';

import React, { useState } from 'react';
import { Newspaper, Flame, Megaphone } from 'lucide-react';
import { useSoundFX } from '@/hooks/useSoundFX';

const BUGLE_HEADLINES = [
  'JJJ EXCLUSIVE: "SPIDER-MAN IS A MENACE! A THREAT TO CIVIC ORDER!" — PUBLISHER J. JONAH JAMESON',
  'PETER PARKER SNAPS FRONT-PAGE PHOTO OF MASKED VIGILANTE PERCHED ATOP CHRYSLER BUILDING!',
  'STARK INDUSTRIES DENIES FUNDING RED-AND-BLUE WALL-CRAWLER AFTER QUEENS INCIDENT',
  'BREAKING: SECOND SPIDER-MAN SEEN IN BROOKLYN ROCKING SPRAY-PAINTED COSTUME & HOODIE',
  'ALCHEMAX CORP IN NUEVA YORK CLAIMS CITADEL INCIDENT WAS JUST "ROUTINE NETWORK TESTING"',
  'DAILY BUGLE OFFERS $10,000 FOR CONVINCING UNMASKED PHOTOGRAPHS — CALL THE DESK NOW!',
  'CLEANUP CREWS REPORT WEB-FLUID COMPLETELY DISSOLVES AFTER TWO HOURS: "AT LEAST NO PERMANENT DAMAGE"',
];

export const TheDailyBugleTicker: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [activeStory, setActiveStory] = useState<string | null>(null);
  const { playClick, playSpiderSense } = useSoundFX();

  return (
    <div className="relative w-full bg-[#E62429] text-white border-y-2 border-black overflow-hidden select-none z-30 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-3 py-1.5 gap-4">
        {/* Bugle Brand Badge */}
        <div className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded font-black font-mono text-xs uppercase tracking-wider whitespace-nowrap shadow-sm">
          <Newspaper className="w-3.5 h-3.5 text-[#FFE600] animate-pulse" />
          <span className="text-[#FFE600]">THE DAILY BUGLE</span>
          <span className="hidden sm:inline text-slate-400 text-[10px]">| SPECIAL EDITION</span>
        </div>

        {/* Continuous Marquee Ticker */}
        <div
          className="flex-1 overflow-hidden relative cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onClick={() => {
            playSpiderSense();
            setActiveStory(BUGLE_HEADLINES[Math.floor(Math.random() * BUGLE_HEADLINES.length)]);
          }}
          title="Click to inspect Daily Bugle front page wire"
        >
          <div
            className={`flex gap-12 whitespace-nowrap font-mono text-xs tracking-wider font-bold transition-all ${
              isPaused ? '' : 'animate-marquee'
            }`}
          >
            {BUGLE_HEADLINES.concat(BUGLE_HEADLINES).map((headline, idx) => (
              <div key={idx} className="inline-flex items-center gap-3">
                <Flame className="w-3.5 h-3.5 text-[#FFE600] inline-block" />
                <span className="text-black font-extrabold">{headline}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action / Bugle Wire Button */}
        <button
          onClick={() => {
            playClick();
            setActiveStory('BUGLE DESK DISPATCH: Peter Parker delivered exclusive 35mm photos of the Wall-Crawler saving commuter trains in Queens. J. Jonah Jameson refuses to give him a staff salary.');
          }}
          className="hidden md:flex items-center gap-1.5 bg-black/80 hover:bg-black text-[#FFE600] px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-widest transition-colors cursor-pointer"
        >
          <Megaphone className="w-3 h-3" />
          <span>JJJ Wire</span>
        </button>
      </div>

      {/* Modal / Alert when clicking headline */}
      {activeStory && (
        <div className="bg-black text-white px-4 py-2 border-t border-[#FFE600]/40 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#FFE600] font-bold">LATEST BUGLE PRINT:</span>
            <span className="text-slate-200">{activeStory}</span>
          </div>
          <button
            onClick={() => setActiveStory(null)}
            className="text-[#FFE600] hover:text-white ml-4 font-bold uppercase text-[10px]"
          >
            [ DISMISS ]
          </button>
        </div>
      )}
    </div>
  );
};
