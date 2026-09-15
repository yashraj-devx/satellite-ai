import React, { useEffect, useState } from 'react';
import { Activity, Radio, Cpu, Compass } from 'lucide-react';

export const TelemetryBanner: React.FC = () => {
  const [activeSat, setActiveSat] = useState('SENTINEL-2A (MSI Optical)');
  const [orbitAltitude, setOrbitAltitude] = useState('786 km');
  const [inclination, setInclination] = useState('98.62° SSO');

  useEffect(() => {
    const sats = [
      { name: 'SENTINEL-2A (MSI Optical VNIR)', alt: '786 km', inc: '98.62° SSO' },
      { name: 'SENTINEL-1B (C-Band SAR Radar)', alt: '693 km', inc: '98.18° Polar' },
      { name: 'CARTOSAT-3 (ISRO 0.28m PAN)', alt: '505 km', inc: '97.5° SSO' },
      { name: 'RISAT-1A (ISRO C-Band SAR)', alt: '543 km', inc: '97.6° SSO' },
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % sats.length;
      setActiveSat(sats[idx].name);
      setOrbitAltitude(sats[idx].alt);
      setInclination(sats[idx].inc);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-space-950/90 border-b border-slate-800/60 px-4 py-1.5 text-[11px] font-mono flex items-center justify-between text-slate-400 overflow-x-auto whitespace-nowrap">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-radar-cyan">
          <span className="w-2 h-2 rounded-full bg-radar-cyan animate-ping" />
          <span className="font-semibold uppercase tracking-wider">Telemetry Stream</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-300">
          <Radio className="w-3 h-3 text-radar-emerald" />
          <span>Active Sensor: <strong className="text-white font-medium">{activeSat}</strong></span>
        </div>
        <div className="hidden sm:flex items-center space-x-1.5 text-slate-400">
          <Compass className="w-3 h-3 text-isro-amber" />
          <span>Orbit: {orbitAltitude} | {inclination}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-slate-400">
          <Cpu className="w-3 h-3 text-radar-purple" />
          <span className="hidden md:inline">Processing: WebAssembly & GPU Canvas</span>
        </div>
        <div className="flex items-center space-x-1.5 text-radar-emerald">
          <Activity className="w-3 h-3" />
          <span>Latency: ~34ms</span>
        </div>
      </div>
    </div>
  );
};
