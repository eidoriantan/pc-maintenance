
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import $ from 'jquery';

import App from './components/App';
import './styles/reset.scss';
import './styles/default.scss';

const root = ReactDOM.createRoot($('#root').get(0));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
