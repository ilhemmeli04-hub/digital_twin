import React, { useState, useEffect, useMemo } from 'react';
import Navigation from './Navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

function Analytics() {
  // 1️⃣ تعريف حالات استقبال البيانات الحية من البايثون (حالات الحساسات الحقيقية)
  const [liveTa, setLiveTa] = useState(30);
  const [liveRH, setLiveRH] = useState(50);
  const [liveT_core, setLiveT_core] = useState(36.5);
  const [liveT_skin, setLiveT_skin] = useState(36.0);

  // حالات تشغيل الأجهزة المشغلة (Actuators) لتغذية الموديل الفيزيائي بدقة
  const [heaterPwm, setHeaterPwm] = useState(0);       
  const [humidifierPwm, setHumidifierPwm] = useState(0); 

  // 2️⃣ دالة جلب البيانات الحية 
  const fetchLiveValues = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/data'); 
      if (response.ok) {
        const data = await response.json();
        if (data && !data.message) {
          // تحديث قيم الحساسات الفعلية الحية المنبثقة من الـ ESP32
          setLiveTa(Number(data.temp || 30)); 
          setLiveRH(Number(data.hum || 50));
          setLiveT_core(Number(data.temp_core || 36.5));
          setLiveT_skin(Number(data.temp_skin || 36.0));

          //🌟 [تصحيح الربط الحركي] م قراءة الحالات مع المتغيرات القادمة من البايثون للتحكم بالمعادلات
          setHeaterPwm(data.heater === 1 ? 100 : 0); 
          setHumidifierPwm(data.fan === 1 ? 100 : 0); 
        }
      }
    } catch (error) {
      console.error("Error fetching live data for Analytics:", error);
    }
  };

  useEffect(() => {
    fetchLiveValues();
    const interval = setInterval(fetchLiveValues, 2000); 
    return () => clearInterval(interval);
  }, []);

  // 3️⃣ توليد منحنيات التنبؤ الرياضية الممتدة لـ 120 دقيقة انطلاقاً من خط الواقع اللحظي الحقيقي
  const data = useMemo(() => {
    const generatedData = [];

    // التنبؤ في خط المحاكاة يبدأ دائماً من قراءة الحساس اللحظية المتجددة
    let Ta_sensor = liveTa;
    let RH_sensor = liveRH;
    let T_core = liveT_core;
    let T_skin = liveT_skin;

    const dt = 1; // خطوة التنبؤ المستمر (دقيقة بدقيقة)

    for (let i = 0; i <= 120; i++) {
      // ---------------- CONSTANTS ----------------
      const rho_air = 1.2;
      const cp_air = 1005;
      const V = 0.166;         // حجم الحاضنة 
      const A_wall = 1.88;     
      const U = 2.5;
      const heater_max_power = 500;
      
      
      const k_h = 50; 
      const k_vent = 0.05;

      const T_room = 25;
      const RH_room = 40;

      const heater_active_pwm = heaterPwm;
      const humidifier_active_pwm = humidifierPwm;

      // ---------------- EQUATIONS ----------------
      const C_air = rho_air * V * cp_air;
      const Q_heater = (heater_active_pwm / 100) * heater_max_power;
      const Q_loss = U * A_wall * (Ta_sensor - T_room);
      const m_dot_vapor = (humidifier_active_pwm / 100) * 0.005; 
      const humidity_loss = k_vent * (RH_sensor - RH_room);

      // معطيات الطفل الخديج (1.5 كغ) 
      const Q_met = 2.3;       
      const k_cs = 2.5;        
      const m_core = 1.3;      
      const c_body = 3500;
      const h_skin = 7.5;      
      const A_skin = 0.13;     
      const m_skin = 0.2;      

      // ---------------- MODELS PREDICTIONS ----------------
      const dTa_dt = (Q_heater - Q_loss) / C_air;
      const Ta_model = Ta_sensor + dTa_dt * dt;

      const dRH_dt = k_h * m_dot_vapor - humidity_loss;
      let RH_model = RH_sensor + dRH_dt * dt;

      
      if (RH_model > 95) RH_model = 95;
      if (RH_model < 10) RH_model = 10;

      const dTc_dt = (Q_met - k_cs * (T_core - T_skin)) / (m_core * c_body);
      const T_core_model = T_core + dTc_dt * dt;

      const dTs_dt = (k_cs * (T_core - T_skin) - h_skin * A_skin * (T_skin - Ta_sensor)) / (m_skin * c_body);
      const T_skin_model = T_skin + dTs_dt * dt;

      
      generatedData.push({
        minute: i,
        Ta: parseFloat(Ta_sensor.toFixed(2)),
        RH: parseFloat(RH_sensor.toFixed(2)),
        T_skin: parseFloat(T_skin.toFixed(2)),
        T_core: parseFloat(T_core.toFixed(2)),
        Ta_model: parseFloat(Ta_model.toFixed(2)),
        RH_model: parseFloat(RH_model.toFixed(2)),
        T_skin_model: parseFloat(T_skin_model.toFixed(2)),
        T_core_model: parseFloat(T_core_model.toFixed(2)),
      });

    
      Ta_sensor = Ta_model;
      RH_sensor = RH_model;
      T_core = T_core_model;
      T_skin = T_skin_model;
    }

    return generatedData;
  }, [liveTa, liveRH, liveT_core, liveT_skin, heaterPwm, humidifierPwm]);

  const generateTicks = (start, end, step) => {
    const ticks = [];
    for (let i = start; i <= end; i = parseFloat((i + step).toFixed(2))) {
      ticks.push(i);
    }
    return ticks;
  };

  const renderChart = (title, sensorKey, modelKey, sensorColor, modelColor, unit, yDomain, yTicks) => (
    <div style={{
      flex: '0 0 48%',
      marginBottom: '20px',
      padding: '10px',
      background: '#fff',
      borderRadius: '8px',
      border: '1px solid #ddd',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="minute" unit=" min" tick={{ fontSize: 10 }} interval={19} />
          <YAxis unit={unit} tick={{ fontSize: 10 }} width={45} domain={yDomain} ticks={yTicks} />
          <Tooltip labelFormatter={(value) => `Minute: ${value}`} contentStyle={{ fontSize: '12px' }} />
          <Legend />
          <Line type="monotone" dataKey={sensorKey} stroke={sensorColor} strokeWidth={2} dot={false} name="Current Live Baseline" />
          <Line type="monotone" dataKey={modelKey} stroke={modelColor} strokeWidth={2} dot={false} strokeDasharray="5 5" name="Predictive Model" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <Navigation />
      <h2 style={{ marginBottom: '5px', textAlign: 'center' }}>
        Real-Time Digital Twin Prediction (0 to 120 Minutes)
      </h2>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '13px', marginBottom: '25px' }}>
        🟢 Connecting Live to ESP32 Hardware Baseline. Dotted lines predict behavior over next 2 hours.
      </p>

      {/* لوحة تأكيد بصري لحظية للقيم الحقيقية القادمة من الحاضنة */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <span style={{ fontSize: '12px' }}>🌡️ Live Air: <b>{liveTa.toFixed(1)}°C</b></span>
        <span style={{ fontSize: '12px' }}>💧 Live Hum: <b>{liveRH.toFixed(1)}%</b></span>
        <span style={{ fontSize: '12px' }}>🧠 Live Core: <b>{liveT_core.toFixed(1)}°C</b></span>
        <span style={{ fontSize: '12px' }}>🛡️ Live Skin: <b>{liveT_skin.toFixed(1)}°C</b></span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '10px' }}>
        {renderChart("Air Temperature Prediction", "Ta", "Ta_model", "#e11d48", "#000", "°C", [20, 45], generateTicks(20, 45, 5))}
        {renderChart("Humidity Prediction", "RH", "RH_model", "#2563eb", "#000", "%", [10, 100], generateTicks(10, 100, 10))}
        {renderChart("Core Temperature Prediction", "T_core", "T_core_model", "#a7a153", "#000", "°C", [30, 42], generateTicks(30, 42, 2))}
        {renderChart("Skin Temperature Prediction", "T_skin", "T_skin_model", "#10b981", "#000", "°C", [30, 42], generateTicks(30, 42, 2))}
      </div>
    </div>
  );
}

export default Analytics;