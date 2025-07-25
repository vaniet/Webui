import React, { useRef, useState } from 'react';

const RegisterForm = ({ onGoLogin }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    // 实际开发中可通过useState管理输入值，此处简化为表单提交获取
    console.log('注册信息:', {
      username: e.target.username.value,
      password: e.target.password.value,
      confirmPassword: e.target.confirmPassword.value,
      phone: e.target.phone.value,
      avatar: e.target.avatar.files[0] // 获取上传的头像文件
    });
    // 这里可以添加实际的注册逻辑
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarUrl(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit} style={{ position: 'relative' }}>
      {/* 用户名 */}
      <div className="form-group">
        <label>用户名</label>
        <input type="text" name="username" className="input-field" placeholder="请输入用户名" />
      </div>

      {/* 密码 */}
      <div className="form-group">
        <label>密码</label>
        <input type="password" name="password" className="input-field" placeholder="请输入密码" />
      </div>

      {/* 确认密码 */}
      <div className="form-group">
        <label>确认密码</label>
        <input type="password" name="confirmPassword" className="input-field" placeholder="请再次输入密码" />
      </div>

      {/* 手机号 */}
      <div className="form-group">
        <label>手机号</label>
        <input type="tel" name="phone" className="input-field" placeholder="请输入手机号" />
      </div>

      {/* 上传头像 */}
      <div className="form-group">
        <label>上传头像</label>
        <div
          className="upload-image-box"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="头像预览" />
          ) : (
            <span className="upload-plus">+</span>
          )}
          <input
            type="file"
            name="avatar"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>
      </div>

      <button type="submit" className="button">注册</button>
      <div style={{ position: 'absolute', right: 0, bottom: -32 }}>
        <span
          style={{ color: '#1890ff', textDecoration: 'underline', cursor: 'pointer', fontSize: 14 }}
          onClick={onGoLogin}
        >
          去登录
        </span>
      </div>
    </form>
  );
};

export default RegisterForm;