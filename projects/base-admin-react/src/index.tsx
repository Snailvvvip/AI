import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import {RouterProvider} from "react-router";
import {router} from "./packages/home/routes";
import {ConfigProvider} from "antd";
import zhCN from 'antd/locale/zh_CN';
import qs from "qs";

window.qs = qs;

const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string') {
    if (args[0].includes('findDOMNode')) {
      return;
    }
    if (args[0].includes('Forget to pass `form` prop?')) {
      return;
    }
  }
  originalError(...args);
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const App = () => {
  return (
    <ConfigProvider locale={zhCN} theme={{
      token: {
        fontFamily: 'PingFangSC-Regular-woff2'
      }
    }}>
      <RouterProvider router={router}/>
    </ConfigProvider>
  );
};
root.render(
  <App/>
);
