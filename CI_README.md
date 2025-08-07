# CI/CD 工作流说明

## 概述

本项目已配置了完整的CI/CD工作流，实现推送时自动测试。

## ✅ 当前状态

- ✅ 测试环境配置完成
- ✅ GitHub Actions工作流已设置
- ✅ 本地测试运行正常
- ✅ 构建功能正常
- ✅ 覆盖率报告生成正常

## 工作流功能

### 1. 自动测试 (CI)
- **触发条件**: 推送到 `main` 或 `develop` 分支，或创建Pull Request
- **测试环境**: Node.js 18.x 和 20.x
- **执行步骤**:
  - 代码检出
  - 依赖安装
  - 代码检查 (ESLint)
  - 单元测试
  - 项目构建
  - 构建产物上传

### 2. 预览部署
- **触发条件**: 仅在Pull Request时
- **功能**: 自动部署到GitHub Pages预览环境
- **访问地址**: `https://[username].github.io/[repo]/preview/[PR-number]`

## 本地测试

### 安装依赖
```bash
npm install
```

### 运行测试
```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试UI界面
npm run test:ui
```

### 代码检查
```bash
npm run lint
```

### 构建项目
```bash
npm run build
```

## 测试文件结构

```
src/
├── test/
│   ├── setup.js          # 测试环境设置
│   └── utils.jsx         # 测试工具函数
├── App.test.jsx          # App组件测试
└── ...
```

## 添加新测试

1. 创建测试文件，命名格式: `*.test.jsx` 或 `*.test.js`
2. 使用Vitest和React Testing Library编写测试
3. 示例:

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import YourComponent from './YourComponent'

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## 工作流文件位置

- `.github/workflows/ci.yml` - 主要的CI/CD工作流
- `vitest.config.js` - Vitest测试配置
- `package.json` - 测试脚本配置

## 注意事项

1. 确保所有测试都能通过
2. 代码检查不能有错误
3. 构建必须成功
4. 测试覆盖率建议保持在80%以上

## 故障排除

### 测试失败
- 检查测试文件语法
- 确保所有依赖已安装
- 查看测试日志获取详细错误信息
- 确保组件有正确的Router包装（如果使用React Router）

### 构建失败
- 检查代码语法错误
- 确保所有导入路径正确
- 验证依赖版本兼容性

### 工作流不触发
- 确保推送到正确的分支
- 检查工作流文件语法
- 验证GitHub Actions权限设置

### 依赖冲突
- 使用 `npm install --legacy-peer-deps` 解决React版本冲突
- 检查package.json中的依赖版本兼容性

## 🎯 下一步建议

1. **添加更多测试**：
   - 为每个组件编写单元测试
   - 添加集成测试
   - 测试用户交互流程

2. **提高覆盖率**：
   - 当前覆盖率约5%，建议提高到80%以上
   - 重点测试核心业务逻辑

3. **代码质量**：
   - 修复ESLint警告和错误
   - 添加TypeScript支持
   - 实施代码审查流程

4. **部署优化**：
   - 配置生产环境部署
   - 添加性能监控
   - 设置错误追踪 