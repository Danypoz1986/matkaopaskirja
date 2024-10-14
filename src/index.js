import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App'; // Ensure App is exported correctly
import reportWebVitals from './reportWebVitals';
import Favorites from './pages/Favorites'; // Ensure Favorites is exported correctly
import LoginPage from './pages/LoginPage'; // Ensure LoginPage is a default export
import RegisterPage from './pages/RegisterPage'; // Ensure RegisterPage is a default export
import SearchPage from './pages/SearchPage'; // Ensure SearchPage is a default export
import { FavoritesProvider } from './context/FavoritesContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <FavoritesProvider>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchPage />} /> {/* New SearchPage route */}
      </Routes>
    </Router>
  </FavoritesProvider>
);

reportWebVitals();
