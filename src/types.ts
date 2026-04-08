export interface Account {
  id: string;
  name: string;
  username: string;
  email?: string;
  password?: string;
  website: string;
  category: 'social' | 'work' | 'finance' | 'entertainment' | 'other';
  logoUrl?: string;
  lastUpdated: string;
  twoFactorEnabled: boolean;
  storageType: string;
}

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: '1',
    name: 'GitHub',
    username: 'octocat_dev_2024',
    email: 'dev_explorer@github.com',
    password: 'S3cureP@ssw0rd!',
    website: 'https://github.com',
    category: 'work',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsNi8jI7qkYPUUmANJoEC53wpPh-XN0QAhtf_goxgxvc90T-X_pv-FhEErVz3yEK63TBrSgXtiL7ErvjQDvK95oByQy3f6sA7ePNZqUTA0Nh4bCK3mB99mmYH-HO7FVCNl6Jyav49eDjfpia1JF2iz0nKYuNI8nAjHT7O7U0Vs9CNfmGP1nJwh_nP8nE9OKCuzqVAGHDbzl7tXCIqiggCiCBqE173Luaukzz6qgGYeOOi4wHiv6R8COEochPlnQs0VDGZqkm0XJHI',
    lastUpdated: '2023年11月14日',
    twoFactorEnabled: true,
    storageType: '加密存储',
  },
  {
    id: '2',
    name: 'Chase Bank',
    username: 'chase_user_primary',
    website: 'https://chase.com',
    category: 'finance',
    lastUpdated: '2024年1月20日',
    twoFactorEnabled: true,
    storageType: '加密存储',
  },
  {
    id: '3',
    name: 'Google Workspace',
    username: 'j.doe@company.com',
    website: 'https://workspace.google.com',
    category: 'work',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByXCP1BnjI_92n3-v6HQKLdBkJl-B0NzwWR7rANOY2WIYOSmsNg2CmoX_84EZGXDpZHm_mnAoTJ-WiF91BqF03tiM9xjvx2NNGHDCu9EJvJ63IICc4Db85wVQkBfO_pcdkDrfOvxp8tIsDj-UG_DEw-T6ww22Vv3WNmwD-zwQYZ9NAZyXWaomC9_k3B7hdQDHM8SzWHqlGfNoSnJ2gLGdOnezL2zQwXxUosHCUKdjLPUadA7bj6FuWHuyxzA4hcfxeXngThnTC6eQ',
    lastUpdated: '2024年2月15日',
    twoFactorEnabled: false,
    storageType: '加密存储',
  },
  {
    id: '4',
    name: 'Netflix',
    username: 'family_account_main',
    website: 'https://netflix.com',
    category: 'entertainment',
    lastUpdated: '2024年3月01日',
    twoFactorEnabled: true,
    storageType: '加密存储',
  },
];
