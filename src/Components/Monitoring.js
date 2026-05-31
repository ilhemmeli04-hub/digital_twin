import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';

function Monitoring() {
  /*mokhazin t3 resultat sensor*/
  const [data, setData] = useState({
    temp: 0,
    hum: 0,
    oxy: 0,
    poids: 0,
    temp_core: 0,
    temp_skin: 0,
    heater_rate: 0,
    water_lavel: 0,
    uv_lavel: 0
  });
  
  // حالة للتأكد من أن السيرفر متصل
  const [isOnline, setIsOnline] = useState(false);
//dala tjib data
  const fetchSensorData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/data'); /*mana njibo akhir 9ym t3 les sensors*/
      if (response.ok) {
        const jsonData = await response.json();
        setData(jsonData); /*ta7dith cart bl 9iyam jdida y3ni yaafichi*/
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      setIsOnline(false);
    }
  };
//hddi t3 ta7dith
  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 1000); /*y3wd y3y6 lal function kol 1s bch tmad 9ima jdida */
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Navigation />
      
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Live Monitoring Dashboard</h2>
        
        {/* مؤشر حالة الاتصال بالسيرفر */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ 
            padding: '5px 15px', 
            borderRadius: '20px', 
            fontSize: '12px',
            backgroundColor: isOnline ? '#e6fffa' : '#fff5f5',
            color: isOnline ? '#38a169' : '#e53e3e',
            border: `1px solid ${isOnline ? '#38a169' : '#e53e3e'}`
          }}>
            {isOnline ? '● Server Connected' : '○ Server Disconnected'}
          </span>
        </div>

        <div style={containerStyle}>
          <div style={cardStyle}>
            <h4>Air Temp</h4>
            <p style={valueStyle}>{data.temp} °C</p>
          </div>

          <div style={cardStyle}>
            <h4>Humidity</h4>
            <p style={valueStyle}>{data.hum} %</p>
          </div>

          <div style={cardStyle}>
            <h4>Oxygen</h4>
            <p style={valueStyle}>{data.oxy} %</p>
          </div>

          <div style={cardStyle}>
            <h4>Weight</h4>
            <p style={valueStyle}>{data.poids} g</p>
          </div>

          <div style={cardStyle}>
            <h4>Temp_core (Baby)</h4>
            <p style={valueStyle}>{data.temp_core} °C</p>
          </div>
          <div style={cardStyle}>
            <h4>Temp_skin (Baby)</h4>
            <p style={valueStyle}>{data.temp_skin} °C</p>
          </div>
          <div style={cardStyle}>
  <h4>Heart Rate</h4>
  <p style={valueStyle}>{data.heart_rate} bpm</p>
</div>

<div style={cardStyle}>
  <h4>UV Level</h4>
  <p style={valueStyle}>{data.uv_level}</p>
</div>

<div style={cardStyle}>
  <h4>Water Level</h4>
  <p style={valueStyle}>{data.water_level}</p>
</div>
        </div>
      </div>
    </div>
  );
}

// chakl les carts
const containerStyle = {
  display: 'flex', 
  justifyContent: 'center', 
  gap: '15px', 
  flexWrap: 'wrap'
};

const cardStyle = {
  background: '#fff',
  border: '1px solid #e1e4e8',
  borderRadius: '12px',
  padding: '15px',
  width: '160px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const valueStyle = {
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '10px 0',
  color: '#2b6cb0'
};

export default Monitoring;