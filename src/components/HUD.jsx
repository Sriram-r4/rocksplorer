import React from "react";

export default function HUD({ data }) {
  if (!data) return null;

  const { distanceKm, distanceKmFormatted, distanceAU, layer, place } = data;

  return (
    <div className="absolute z-10 top-4 left-1/2 -translate-x-1/2 select-none pointer-events-none w-full max-w-5xl px-4">
      <div className="relative backdrop-blur-lg bg-slate-900/90 rounded-lg border-2 border-cyan-500/60 shadow-2xl shadow-cyan-500/30 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-400/10 to-transparent h-full animate-[scan_2s_linear_infinite] pointer-events-none"></div>

        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(34, 211, 238, 0.3) 1px, rgba(34, 211, 238, 0.3) 2px)",
          }}
        ></div>

        <div className="bg-linear-to-r from-emerald-900/40 via-green-900/40 to-emerald-900/40 border-b border-green-500/40 px-3 py-0.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <span className="text-[9px] sm:text-[10px] font-mono text-green-300/80 tracking-widest uppercase">
              TELEMETRY ACTIVE
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono text-red-400 font-bold tracking-wider">
            RIRA
          </span>
        </div>

        <div className="relative px-3 sm:px-5 py-2.5 sm:py-3">
          <div className="grid grid-cols-12  items-center border-b border-cyan-500/20 pb-2 mb-2">
            <div className="col-span-6 sm:col-span-8  ">
              <div className="text-[9px] sm:text-[10px] font-mono text-cyan-400/60 tracking-widest uppercase mb-0.5">
                DISTANCE
              </div>
              <h1
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-[0.15em] text-cyan-400"
                style={{
                  fontFamily: "'Orbitron', 'DS-Digital', monospace",
                  letterSpacing: "0.1em",
                }}
              >
                {distanceKmFormatted}
              </h1>
            </div>

            <div className="col-span-6 sm:col-span-4 text-right flex justify-end gap-1 sm:gap-2">
              <div className="flex flex-col gap-0" >
              <div className="text-[9px] sm:text-[10px] font-mono text-end text-green-400/60 tracking-widest uppercase mb-0.5">
                AU
              </div>
              <h2 className="text-sm sm:text-base md:text-lg font-mono text-green-400 tracking-wider">
                {distanceAU}
              </h2>
              </div>
               <div className=" flex flex-col gap-1 sm:gap-2 end-0 justify-center items-end">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50"></div>
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse delay-75 shadow-lg shadow-amber-400/50"></div>
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse delay-150 shadow-lg shadow-green-400/50"></div>
            </div>
            </div>
           
          </div>

          <div className="grid grid-cols-12 gap-1 sm:gap-4 items-center">
            <div className="col-span-6 sm:col-span-6">
              <div className="text-[9px]  sm:text-[10px] font-mono text-sky-400/60 tracking-widest uppercase mb-0.5">
                LAYER
              </div>
              <p className="text-xs sm:text-sm md:text-base font-mono font-semibold text-sky-300 tracking-wide">
                {layer}
              </p>
            </div>

            <div className="col-span-6 sm:col-span-6 text-right">
              <div className="text-[9px] sm:text-[10px] font-mono text-indigo-400/60 tracking-widest uppercase mb-0.5">
                LOCATION
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-indigo-300/90 font-mono tracking-wide truncate">
                {place}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-cyan-500 to-transparent"></div>
          <div className="absolute top-0 left-0 w-0.5 h-full bg-linear-to-b from-cyan-500 to-transparent"></div>
        </div>
        <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8">
          <div className="absolute top-0 right-0 w-full h-0.5 bg-linear-to-l from-cyan-500 to-transparent"></div>
          <div className="absolute top-0 right-0 w-0.5 h-full bg-linear-to-b from-cyan-500 to-transparent"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8">
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-cyan-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-0.5 h-full bg-linear-to-t from-cyan-500 to-transparent"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8">
          <div className="absolute bottom-0 right-0 w-full h-0.5 bg-linear-to-l from-cyan-500 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-0.5 h-full bg-linear-to-t from-cyan-500 to-transparent"></div>
        </div>

        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-linear-to-b from-cyan-500 via-slate-900 to-cyan-500 opacity-60"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-linear-to-b from-cyan-500 via-slate-900 to-cyan-500 opacity-60"></div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
