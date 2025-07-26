import React from 'react';
import './component/commonStyles.css';
import LoginForm from './component/LoginForm';
import RegisterForm from './component/RegisterForm';
import { Route, Routes } from "react-router-dom";
import MainPage from "./component/MainPage.jsx";
import CreateSeries from "./component/CreateSeries.jsx";

const App = () => {

  return (
    <div className="fullscreen-gradient-bg">
      {/* 路由规则（新增MainPage的路由） */}
      <Routes>
        <Route path="/" element={<LoginForm />} /> {/* 默认显示登录页 */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/mainpage" element={<MainPage />} /> {/* 新增主页面路由 */}
        <Route path="/createseries" element={<CreateSeries />} /> {/* 新增创建系列路由 */}
      </Routes>
    </div>
  );
};

export default App;
