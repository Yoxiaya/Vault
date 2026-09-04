export interface Account {
	id: number;
	appName: string;
	username: string;
	email?: string | null;
	password: string;
	webSite: string | null;
	category: 'social' | 'work' | 'finance' | 'entertainment' | 'other';
	logoUrl?: string | null;
	logoImageId?: number | null;
	lastUpdated: string | null;
	twoFactorEnabled: boolean | null;
	storageType: string | null;
	description?: string | null;
	userId: number;
}
export type AccountCategory = Account['category'];
