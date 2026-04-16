export interface Account {
	id: string;
	appName: string;
	username: string;
	email?: string;
	password?: string;
	webSite: string;
	category: 'social' | 'work' | 'finance' | 'entertainment' | 'other';
	logoUrl?: string;
	lastUpdated: string;
	twoFactorEnabled: boolean;
	storageType: string;
	description?: string;
}
export type UploadAccount = Omit<Account, 'id'>;
export type AccountCategory = Account['category'];
