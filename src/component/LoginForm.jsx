import React, { useState } from 'react';

function TopMessage({ message, type, onClose }) {
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 1800);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div className={`top-message top-message-${type}`}>{message}</div>
  );
}

const LoginForm = ({ onGoRegister }) => {
  const [fields, setFields] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:7001/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: fields.username,
          password: fields.password
        })
      });
      const data = await res.json();
      if (data.code === 200) {
        setMsgType('success');
        setMsg(`登陆成功，${data.data.user.username}`);
        // 保存token和用户id到localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userId', data.data.user.userId);
      } else {
        setMsgType('error');
        setMsg(`登陆失败，${data.message}`);
      }
    } catch (err) {
      setMsgType('error');
      setMsg('登陆失败，网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopMessage message={msg} type={msgType} onClose={() => setMsg('')} />
      <form className="form-container" onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <div className="form-group">
          <label>用户名</label>
          <input
            type="text"
            name="username"
            className="input-field"
            placeholder="请输入用户名"
            value={fields.username}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>密码</label>
          <input
            type="password"
            name="password"
            className="input-field"
            placeholder="请输入密码"
            value={fields.password}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="button" disabled={loading}>{loading ? '登录中...' : '登录'}</button>
        <div style={{ position: 'absolute', right: 0, bottom: -32 }}>
          <span
            style={{ color: '#1890ff', textDecoration: 'underline', cursor: 'pointer', fontSize: 14 }}
            onClick={onGoRegister}
          >
            去注册
          </span>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
