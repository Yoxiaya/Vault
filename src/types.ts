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
export type AccountCategory = Account['category'];
