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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Weather Card */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="lg:col-span-2 minimal-card p-8 flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary animate-pulse">
            <Sun size={48} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.3em] mb-2 block">Current Weather</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-6xl font-black text-brand-text dark:text-dark-text font-display">29°</h3>
              <span className="text-xl font-bold text-brand-muted">C</span>
            </div>
            <p className="text-sm font-bold text-brand-text dark:text-dark-text uppercase tracking-widest mt-2">Sunny • Talibon, Bohol</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 w-full md:w-auto">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-brand-muted">
              <Wind size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Wind</span>
            </div>
            <p className="text-sm font-black text-brand-text dark:text-dark-text">12 km/h NE</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-brand-muted">
              <CloudRain size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Humidity</span>
            </div>
            <p className="text-sm font-black text-brand-text dark:text-dark-text">78%</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-brand-muted">
              <Thermometer size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Feels Like</span>
            </div>
            <p className="text-sm font-black text-brand-text dark:text-dark-text">32°C</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-brand-muted">
              <Navigation size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Visibility</span>
            </div>
            <p className="text-sm font-black text-brand-text dark:text-dark-text">10 km</p>
          </div>
        </div>
      </motion.div>

      {/* Tide Card */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="minimal-card p-8 bg-brand-primary text-white dark:bg-brand-primary"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[10px] font-extrabold text-orange-100 uppercase tracking-[0.3em] mb-1 block">Tide Forecast</span>
            <h3 className="text-xl font-black font-display">Coastal Info</h3>
          </div>
          <Waves size={24} className="text-brand-secondary animate-bounce" />
        </div>

        <div className="space-y-4">
          {tideData.map((tide, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-white/15 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${tide.type === "High" ? "bg-amber-300" : "bg-orange-200"}`} />
                <span className="text-xs font-bold uppercase tracking-widest">{tide.time}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-black">{tide.level}</p>
                <p className="text-[8px] font-extrabold uppercase tracking-widest text-orange-100">{tide.type} Tide</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/15 flex justify-between items-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-100">Local Time</span>
          <span className="text-sm font-black font-mono text-white">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </motion.div>
    </div>
  );
}
