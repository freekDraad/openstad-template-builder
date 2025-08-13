// main.tsx
// Vite entry point: rendert App component in #root

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Tailwind styles

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Uitleg:
// - Rendert App component in root element.
// - Importeert Tailwind styles via index.css.
