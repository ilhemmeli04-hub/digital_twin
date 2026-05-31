
import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import Dashboard from './Dashboard';

import Monitoring from './Components/Monitoring';
import History from './Components/History';
import View3D from './Components/View3D';
import Analytics from './Components/Analytics';
import Simulation from './Components/Simulation';

function App() {
  return (
    <Router>

      <div className="App">

        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/monitoring"
            element={<Monitoring />}
          />

          <Route
            path="/history"
            element={<History />}
          />

          <Route
            path="/3dview"
            element={<View3D />}
          />

          <Route
            path="/simulation"
            element={<Simulation />}
          />

          <Route
            path="/graphs"
            element={<Analytics />}
          />

        </Routes>

      </div>

    </Router>
  );
}

export default App;