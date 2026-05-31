import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';

function Main() {
  return (
    <div>
      <Navigation />
      <h1>Main View</h1>
      <div>
        <Link to="/monitoring">
          <button>Monitoring</button>
        </Link>
        <Link to="/history">
          <button>History</button>
        </Link>
        <Link to="/3dview">
          <button>3D View</button>
        </Link>
        <Link to="/graphs">
          <button>Graphs</button>
        </Link>
        <Link to="/simulation">
          <button>Simulation</button>
        </Link>
         <Link to="/3dexmpl">
          <button>3d exmpl</button>
        </Link>
      </div>
    </div>
  );
}

export default Main;