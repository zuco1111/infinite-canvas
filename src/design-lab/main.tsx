import 'antd/dist/reset.css';
import '../styles/index.css';
import './app/design-lab.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { DesignLabRoot } from './app/DesignLabRoot';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DesignLabRoot />
  </React.StrictMode>,
);
