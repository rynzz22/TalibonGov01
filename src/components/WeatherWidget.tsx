import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Cloud, Sun, CloudRain, Wind, Waves, Thermometer, Navigation } from "lucide-react";

export default function WeatherWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tideData = [
    { time: "04:12 AM", level: "1.2m", type: "High" },
    { time: "10:45 AM", level: "0.3m", type: "Low" },
    { time: "05:20 PM", level: "1.1m", type: "High" },
    { time: "11:30 PM", level: "0.4m", type: "Low" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
      {/* Weather Card */}
      <motion.div 
        whileHover={{ y: -4 }}
        className="lg:col-span-2 minimal-card p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5 sm:gap-6">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-brand-secondary/20 flex items-center justify-center text-brand-secondary shrink-0 animate-pulse">
            <Sun size={34} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                LIVE WEATHER DATA
              </span>
              <span className="text-[10px] text-brand-muted font-medium">• PAGASA Meteorological Stream</span>
            </div>
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.25em] mb-1.5 block">Current Weather</span>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-4xl sm:text-5xl font-black text-brand-text dark:text-dark-text font-display tracking-tight">29°</h3>
              <span className="text-lg font-bold text-brand-muted">C</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-brand-text dark:text-dark-text uppercase tracking-widest mt-1.5">Sunny • Talibon, Bohol</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-brand-border/40">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-brand-muted">
              <Wind size={13} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Wind</span>
            </div>
            <p className="text-xs sm:text-sm font-black text-brand-text dark:text-dark-text">12 km/h NE</p>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-brand-muted">
              <CloudRain size={13} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Humidity</span>
            </div>
            <p className="text-xs sm:text-sm font-black text-brand-text dark:text-dark-text">78%</p>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-brand-muted">
              <Thermometer size={13} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Feels Like</span>
            </div>
            <p className="text-xs sm:text-sm font-black text-brand-text dark:text-dark-text">32°C</p>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-brand-muted">
              <Navigation size={13} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Visibility</span>
            </div>
            <p className="text-xs sm:text-sm font-black text-brand-text dark:text-dark-text">10 km</p>
          </div>
        </div>
      </motion.div>

      {/* Tide Card */}
      <motion.div 
        whileHover={{ y: -4 }}
        className="minimal-card p-5 sm:p-6 bg-brand-primary text-white dark:bg-brand-primary flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[9px] font-extrabold text-orange-100 uppercase tracking-[0.25em] mb-0.5 block">Tide Forecast</span>
              <h3 className="text-lg font-bold font-display tracking-tight">Coastal Info</h3>
            </div>
            <Waves size={20} className="text-brand-secondary animate-bounce" />
          </div>

          <div className="space-y-2">
            {tideData.map((tide, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/15 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${tide.type === "High" ? "bg-amber-300" : "bg-orange-200"}`} />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">{tide.time}</span>
                </div>
                <div className="text-right">
                  <p className="text-[11px] sm:text-xs font-black">{tide.level}</p>
                  <p className="text-[8px] font-extrabold uppercase tracking-wider text-orange-100">{tide.type} Tide</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-white/15 flex justify-between items-center">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-100">Local Time</span>
          <span className="text-xs sm:text-sm font-black font-mono text-white">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </motion.div>
    </div>
  );
}
