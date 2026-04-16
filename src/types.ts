export const ACCOUNT_CATEGORIES = {
	social: '社交',
	work: '工作',
	finance: '财务',
	entertainment: '娱乐',
	other: '其他',
};

export interface Account {
	id: string;
	appName: string;
	username: string;
	email?: string;
	password?: string;
	webSite: string;
	category: keyof typeof ACCOUNT_CATEGORIES;
	logoUrl?: string;
	lastUpdated: string;
	twoFactorEnabled: boolean;
	storageType: string;
	description?: string;
}
export type UploadAccount = Omit<Account, 'id'>;
export type AccountCategory = Account['category'];
