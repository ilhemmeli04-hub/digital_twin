import React from 'react';
import { Link } from 'react-router-dom';

export default function Overlay({ temperature, humidity }) {
  return (
    <>
      {/* Back Button */}
      <Link 
        to="/"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          borderRadius: '5px',
          textDecoration: 'none',
          zIndex: 100
        }}
      >
        ← Back to Main
      </Link>
      
      {/* Optional additional overlay elements */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 100
      }}>
        <div>Temperature: {temperature}°C</div>
        <div>Humidity: {humidity}%</div>
      </div>
    </>
  );
}