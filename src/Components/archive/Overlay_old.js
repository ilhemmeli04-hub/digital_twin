import React from 'react';

export default function Overlay({ temperature, humidity }) {
  return (
    <>
      {/* Information Overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        zIndex: 100
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Greenhouse Status</h3>
        <div style={{ marginBottom: '5px' }}>🌡️ Temperature: <strong>{temperature}°C</strong></div>
        <div>💧 Humidity: <strong>{humidity}%</strong></div>
      </div>
      
      {/* Back Button */}
      <button 
        onClick={() => window.history.back()}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          padding: '10px 15px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 100
        }}
      >
        ← Back to Dashboard
      </button>
    </>
  );
}