import React from 'react';
import './component/commonStyles.css';
import LoginForm from './component/LoginForm';
import RegisterForm from './component/RegisterForm';
import { Route, Routes } from "react-router-dom";
import MainPage from "./component/MainPage.jsx";
import CreateSeries from "./component/CreateSeries.jsx";
import Series from "./component/Series.jsx";

const App = () => {
  return (
    <>
      <div className="fullscreen-gradient-bg"></div>
      <div className="app-content">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/mainpage" element={<MainPage />} />
          <Route path="/createseries" element={<CreateSeries />} />
          <Route path="/series/:id" element={<Series />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
