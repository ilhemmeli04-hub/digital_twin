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

    // الثوابت الفيزيائية 
    const V_new = 0.166;         // الحجم  للحاضنة بالمتر المكعب
    const A_wall_new = 1.88;     // المساحة السطحية 
    const rho_air = 1.2;
    const cp_air = 1005;
    
    // حساب السعة الحرارية 
    const Cair_new = rho_air * V_new * cp_air; 

    // معطيات الرضيع الخديج المضبوطة (1.5 كغ)
    const m_core_new = 1.3;     
    const m_skin_new = 0.2;      
    const c_body = 3500;
    const k_cs_new = 2.5;        
    const h_skin = 7.5;       
    const A_skin_new = 0.13;     
    const Q_met_new = 2.3;     

    for (let t = 0; t < steps; t += 10) {
      // 1) نموذج درجة حرارة الهواء المحدث
      const Q_heater = (settings.heater / 100.0) * 500; 
      const Q_loss = 2.5 * A_wall_new * (Ta - 25.0);    
      Ta += ((Q_heater - Q_loss) / Cair_new) * 10;      

      // 2) نموذج الرطوبة النسبية المحدث باستبدال القيم مباشرة
      const humidity_loss = 0.05 * (RH - 40.0); 
      const dRH_dt = 50 * ((settings.humidity / 100.0) * 0.005) - humidity_loss;
      RH = Math.max(0, Math.min(RH + dRH_dt * 10, 100));

      // 3) النموذج الحراري للرضيع 
      const dTc_dt = (Q_met_new - k_cs_new * (T_core - T_skin)) / (m_core_new * c_body);
      const dTs_dt = (k_cs_new * (T_core - T_skin) - h_skin * A_skin_new * (T_skin - Ta)) / (m_skin_new * c_body);
      
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
        <h3>Simulation Settings</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '15px' }}>
          <div>
            <label>Heater PWM: </label>
            <input type="range" min="0" max="100" value={settings.heater} onChange={(e) => setSettings({...settings, heater: e.target.value})} />
            <span> {settings.heater}%</span>
          </div>
          <div>
            <label>Humidifier PWM: </label>
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
          Run Simulation
        </button>
      </div>

      <h4>Temperature Graph</h4>
      <div style={{ width: '100%', height: 320, background: '#f9f9f9', borderRadius: '8px', marginBottom: '40px', paddingBottom: '15px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={results} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -10 }} />
            <YAxis label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', offset: 0 }} domain={['auto', 'auto']} />
            <Tooltip />
            <Legend verticalAlign="top" height={36}/>
            <Line type="monotone" dataKey="air" stroke="#ff7300" name="Air Temperature" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="core" stroke="#1c15a1" name="Core Temperature" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="skin" stroke="#169446" name="Skin Temperature" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h4>Humidity Graph</h4>
      <div style={{ width: '100%', height: 320, background: '#f0faff', borderRadius: '8px', paddingBottom: '15px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={results} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -10 }} />
            <YAxis label={{ value: 'Humidity (%)', angle: -90, position: 'insideLeft', offset: 10 }} domain={[0, 100]} />
            <Tooltip />
            <Legend verticalAlign="top" height={36}/>
            <Line type="monotone" dataKey="humidity" stroke="#0088FE" name="Relative Humidity" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Simulation;