import React, { useState } from 'react';
import './component/commonStyles.css';
import LoginForm from './component/LoginForm';
import RegisterForm from './component/RegisterForm';

const App = () => {
  const [formType, setFormType] = useState('login');

  return (
    <div className="fullscreen-gradient-bg">
      {formType === 'login' && <LoginForm onGoRegister={() => setFormType('register')} />}
      {formType === 'register' && <RegisterForm onGoLogin={() => setFormType('login')} />}
    </div>
  );
};

export default App;
