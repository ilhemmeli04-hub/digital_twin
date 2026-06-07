import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';

function History() {
  const [historyData, setHistoryData] = useState([]);//9aiimat bynat li jaya mn python w tkon frgha mn lwl
  const [loading, setLoading] = useState(true); // mzl t7ml fl bynat
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/history'); //flask yb3th 6lb l react w yroh l route t3 python
      if (response.ok) {
        const jsonData = await response.json();
        setHistoryData(jsonData); //ykhzan bayanat dkl history data
        setError(null);
      } else {
        setError("Failed to fetch data from server");
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Server is not responding. Make sure Python is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000); // تحديث كل 10 ثوانٍ
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Navigation />
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>📊 Incubator History Log</h2>
      
      {loading && <p style={{ textAlign: 'center' }}>Loading historical data...</p>}
      
      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '5px', textAlign: 'center', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {!loading && !error && historyData.length === 0 && <p style={{ textAlign: 'center' }}>No recorded data available at the moment.</p>}

        {historyData.map((item, index) => (
          <div key={index} style={cardStyle}>
            <div style={timeHeaderStyle}>
              <span>📅 {item.timestamp}</span>
              <span style={badgeStyle}>Record #{historyData.length - index}</span>
            </div>
            
            <div style={gridContainerStyle}>
              <div style={dataItemStyle}>🌡️ Air Temp: <b>{item.temp}°C</b></div>
              <div style={dataItemStyle}>💧 Humidity: <b>{item.hum}%</b></div>
              <div style={dataItemStyle}>🧠 Core Temp: <b>{item.temp_core}°C</b></div>
              <div style={dataItemStyle}>🩹 Skin Temp: <b>{item.temp_skin}°C</b></div>
              <div style={dataItemStyle}>❤️ Heart Rate: <b>{item.heart_rate} bpm</b></div>
              <div style={dataItemStyle}>⚖️ Weight: <b>{item.poids} g</b></div>
              <div style={dataItemStyle}>☀️ UV Level: <b>{item.uv_level}</b></div>
              <div style={dataItemStyle}>🫙 Water: <b>{item.water_level}%</b></div>
              <div style={dataItemStyle}>🌬️ Oxygen: <b>{item.oxy}%</b></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// التنسيقات (CSS-in-JS)
const cardStyle = {
  backgroundColor: '#fff',
  borderLeft: '5px solid #3498db',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '15px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease-in-out'
};

const timeHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '1px solid #eee',
  paddingBottom: '8px',
  marginBottom: '10px',
  color: '#7f8c8d',
  fontSize: '0.9rem'
};

const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '10px'
};

const dataItemStyle = {
  fontSize: '14px',
  color: '#34495e',
  padding: '5px',
  backgroundColor: '#f9f9f9',
  borderRadius: '4px'
};

const badgeStyle = {
  backgroundColor: '#3498db',
  color: 'white',
  padding: '2px 8px',
  borderRadius: '10px',
  fontSize: '11px'
};

export default History;