import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import AppointmentsDashboard from './pages/AppointmentsDashboard.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/appointments" element={<AppointmentsDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

