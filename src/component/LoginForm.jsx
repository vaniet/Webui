import React from 'react';

const LoginForm = ({ onGoRegister }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // 这里可以添加实际的登录逻辑
  };

  return (
    <form className="form-container" onSubmit={handleSubmit} style={{ position: 'relative' }}>
      <div className="form-group">
        <label>用户名</label>
        <input type="text" className="input-field" placeholder="请输入用户名" />
      </div>
      <div className="form-group">
        <label>密码</label>
        <input type="password" className="input-field" placeholder="请输入密码" />
      </div>
      <button type="submit" className="button">登录</button>
      <div style={{ position: 'absolute', right: 0, bottom: -32 }}>
        <span
          style={{ color: '#1890ff', textDecoration: 'underline', cursor: 'pointer', fontSize: 14 }}
          onClick={onGoRegister}
        >
          去注册
        </span>
      </div>
    </form>
  );
};

export default LoginForm;
