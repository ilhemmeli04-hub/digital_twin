import React, { useState } from 'react';
import Navigation from './Navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Simulation = () => {
  const [results, setResults] = useState([]);
  const [settings, setSettings] = useState({ 
    heater: 30, 
    humidity: 40,
    initAir: 30.0,   
    initCore: 36.5,  
    initSkin: 35.5   
  });

  const startSimulation = () => {
    let Ta = parseFloat(settings.initAir);
    let T_core = parseFloat(settings.initCore);
    let T_skin = parseFloat(settings.initSkin);
    let RH = 40.0; 
    const steps = 3500; 
    const tempResults = [];

    for (let t = 0; t < steps; t += 10) {
      const Q_heater = (settings.heater / 100.0) * 500;
      const Q_loss = 2.5 * 1.5 * (Ta - 25.0);
      Ta += (Q_heater - Q_loss) / (1.2 * 0.12 * 1005) * 10;

      const humidity_loss = 0.0005 * (RH - 40.0); 
      const dRH_dt = 50000 * ((settings.humidity / 100.0) * 0.00001) - humidity_loss;
      RH = Math.max(0, Math.min(RH + dRH_dt * 10, 100));

      const dTc_dt = (8 - 5 * (T_core - T_skin)) / (1.5 * 3500);
      const dTs_dt = (5 * (T_core - T_skin) - 8 * 0.1 * (T_skin - Ta)) / (0.5 * 3500);
      T_core += dTc_dt * 10;
      T_skin += dTs_dt * 10;

      tempResults.push({
        time: t,
        air: parseFloat(Ta.toFixed(2)),
        core: parseFloat(T_core.toFixed(2)),
        skin: parseFloat(T_skin.toFixed(2)),
        humidity: parseFloat(RH.toFixed(2))
      });
    }
    setResults(tempResults);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ background: '#eee', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
      <Navigation />
        <h3>إعدادات المحاكاة (Simulation Settings)</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '15px' }}>
          <div>
            <label>heater_Pwm%: </label>
            <input type="range" min="0" max="100" value={settings.heater} onChange={(e) => setSettings({...settings, heater: e.target.value})} />
            <span> {settings.heater}%</span>
          </div>
          <div>
            <label>Humidifier_Pwm%: </label>
            <input type="range" min="0" max="100" value={settings.humidity} onChange={(e) => setSettings({...settings, humidity: e.target.value})} />
            <span> {settings.humidity}%</span>
          </div>
          <div>
            <label>T_Air: </label>
            <input type="range" min="20" max="45" step="0.5" value={settings.initAir} onChange={(e) => setSettings({...settings, initAir: e.target.value})} />
            <span> {settings.initAir}</span>
          </div>
          <div>
            <label>T_Core: </label>
            <input type="range" min="30" max="42" step="0.1" value={settings.initCore} onChange={(e) => setSettings({...settings, initCore: e.target.value})} />
            <span> {settings.initCore}</span>
          </div>
          <div>
            <label>T_Skin: </label>
            <input type="range" min="30" max="40" step="0.1" value={settings.initSkin} onChange={(e) => setSettings({...settings, initSkin: e.target.value})} />
            <span> {settings.initSkin}</span>
          </div>
        </div>

        <button onClick={startSimulation} style={{ padding: '8px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Run
        </button>
      </div>

      <h4>مخطط درجات الحرارة</h4>
      <div style={{ width: '100%', height: 300, background: '#f9f9f9', borderRadius: '8px', marginBottom: '30px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={results}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis unit="C" domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="air" stroke="#ff7300" name="Air" dot={false} />
            <Line type="monotone" dataKey="core" stroke="#1c15a1" name="Core" dot={false} />
            <Line type="monotone" dataKey="skin" stroke="#169446" name="Skin" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h4>مخطط الرطوبة النسبية</h4>
      <div style={{ width: '100%', height: 300, background: '#f0faff', borderRadius: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={results}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis unit="%" domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="humidity" stroke="#0088FE" name="Humidity %" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Simulation;