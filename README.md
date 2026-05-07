# Vault - 密码管理应用

一个安全、高效的密码管理应用，帮助用户存储和管理各种账户的密码信息。

## 功能特性

- 📱 **跨平台支持**：同时支持 iOS、Android 和 Web 平台
- 🔒 **安全存储**：安全管理账户密码信息
- 🔍 **快速搜索**：支持按应用名称和用户名搜索
- 📁 **分类管理**：支持按分类查看账户（社交、财务、娱乐、其他）
- ✏️ **账户编辑**：方便地添加、编辑和管理账户信息
- 🔐 **密码生成**：内置密码生成器，创建强密码
- 📊 **健康检查**：检查密码强度和安全性
- ⚙️ **个性化设置**：自定义应用设置

## 技术栈

- **前端框架**：React Native + Expo
- **状态管理**：Zustand
- **表单管理**：React Hook Form
- **导航**：React Navigation
- **UI 组件**：React Native 内置组件 + Expo Vector Icons
- **类型系统**：TypeScript
- **密码生成**：内置密码生成算法
- **数据持久化**：本地存储

## 安装与运行

### 前置要求

- Node.js 16.x 或更高版本
- npm 或 yarn
- Expo CLI
- iOS/Android 模拟器或真机（可选）

### 安装步骤

1. **克隆项目**

```bash
git clone <项目地址>
cd Vault
```

2. **安装依赖**

```bash
npm install
# 或
yarn install
```

3. **启动开发服务器**

```bash
npm start
# 或
yarn start
```

4. **运行应用**

- **iOS 模拟器**：在终端按 `i`
- **Android 模拟器**：在终端按 `a`
- **Web 浏览器**：在终端按 `w`
- **Expo Go 应用**：扫描终端中的二维码

5. **项目构建**

```bash
eas build --platform android --profile preview
```

## 项目结构

```
Vault/
├── assets/                # 静态资源文件
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── src/                   # 源代码
│   ├── components/        # 可复用组件
│   │   ├── Footer.tsx     # 底部导航栏
│   │   ├── Mask.tsx       # 遮罩组件
│   │   └── SkeletonItem.tsx # 骨架屏组件
│   ├── pages/             # 页面组件
│   │   ├── AccountDetailsPage.tsx # 账户详情页
│   │   ├── EditAccountPage.tsx    # 编辑账户页
│   │   ├── GeneratorPage.tsx      # 密码生成器
│   │   ├── HealthPage.tsx         # 健康检查页
│   │   ├── SettingsPage.tsx       # 设置页
│   │   ├── TestPage.tsx           # 测试页
│   │   └── VaultPage.tsx          # 主页
│   ├── service/           # 服务层
│   │   ├── api/           # API 相关
│   │   └── convert/       # 转换工具
│   ├── store/             # 状态管理
│   │   ├── index.ts
│   │   └── useAccountsStore.ts # 账户状态管理
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 应用入口
│   └── types.ts           # 类型定义
├── .gitignore             # Git 忽略文件
├── App.tsx                # 根入口文件
├── README.md              # 项目说明
├── app.json               # Expo 配置
├── index.ts               # 入口文件
├── package-lock.json      # npm 依赖锁定
├── package.json           # 项目配置和依赖
└── tsconfig.json          # TypeScript 配置
```

## 核心功能模块

### 1. 账户管理

- **添加账户**：支持添加新的账户信息，包括应用名称、用户名、密码、网站等
- **编辑账户**：修改现有账户信息
- **查看详情**：查看账户详细信息
- **分类管理**：按分类组织账户

### 2. 密码生成

- **自定义密码**：根据用户需求生成强密码
- **密码强度**：实时显示密码强度
- **一键复制**：方便地复制生成的密码

### 3. 健康检查

- **密码强度分析**：检查账户密码的强度
- **安全建议**：提供安全改进建议
- **重复密码检测**：检测重复使用的密码

### 4. 设置

- **主题设置**：切换应用主题
- **安全设置**：配置安全选项
- **数据管理**：导出/导入数据

## 数据结构

### 账户信息

```typescript
interface Account {
	id: string; // 账户唯一标识
	appName: string; // 应用名称
	username: string; // 用户名
	email?: string; // 邮箱（可选）
	password?: string; // 密码（可选）
	webSite: string; // 网站地址
	category: string; // 分类
	logoUrl?: string; // 图标 URL（可选）
	lastUpdated: string; // 最后更新时间
	twoFactorEnabled: boolean; // 是否启用双因素认证
	storageType: string; // 存储类型
	description?: string; // 描述（可选）
}
```

### 账户分类

```typescript
export const ACCOUNT_CATEGORIES = {
	social: '社交',
	work: '工作',
	finance: '财务',
	entertainment: '娱乐',
	other: '其他',
};
```

## 使用指南

### 添加新账户

1. 在主页点击右下角的 "+", 按钮
2. 填写账户信息，包括应用名称、用户名、密码等
3. 选择账户分类
4. 点击 "保存修改" 按钮

### 搜索账户

1. 在主页顶部的搜索框中输入应用名称或用户名
2. 搜索结果会实时显示

### 按分类查看账户

1. 在主页的分类标签中选择相应的分类
2. 页面会显示该分类下的所有账户

### 生成密码

1. 导航到 "生成器" 页面
2. 根据需要调整密码长度和包含的字符类型
3. 点击 "生成" 按钮
4. 点击 "复制" 按钮复制生成的密码

## 开发指南

### 代码风格

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 组件命名使用 PascalCase
- 函数和变量命名使用 camelCase
- 使用箭头函数

### 提交规范

- **feat**：添加新功能
- **fix**：修复 bug
- **docs**：文档更新
- **style**：代码风格调整
- **refactor**：代码重构
- **test**：测试相关
- **chore**：构建或依赖更新

## 贡献

欢迎贡献代码、报告 bug 或提出建议！

1. Fork 项目
2. 创建分支
3. 提交更改
4. 发起 Pull Request

## 许可证

本项目使用 0BSD 许可证。详见 [LICENSE](LICENSE) 文件。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱：171149510@qq.com
- GitHub：[Yoxiaya](https://github.com/Yoxiaya)

---

**Vault** - 让密码管理更简单、更安全！ 🔒
