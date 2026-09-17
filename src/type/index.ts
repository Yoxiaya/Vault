export interface Account {
	id: number;
	appName: string;
	username: string;
	email?: string | null;
	password: string;
	webSite: string | null;
	categoryId: string | null;
	logoUrl?: string | null;
	logoImageId?: number | null;
	lastUpdated: string | null;
	twoFactorEnabled: boolean | null;
	description?: string | null;
	userId: number;
}

export interface AccountSecret {
	username: string;
	password?: string;
	email?: string | null;
	webSite?: string | null;
	twoFactorEnabled?: boolean | null;
	description?: string | null;
}

export interface EncryptedAccountPayload {
	appName: string;
	categoryId: string | null;
	lastUpdated?: string | null;
	encryptedData: import('vault-cryption').EncryptedRecord;
}

export interface EncryptedAccountResponse extends EncryptedAccountPayload {
	id: string | number;
	logoUrl?: string | null;
	logoImageId?: string | number | null;
}

export type CategoryIcon =
	| 'share'
	| 'briefcase'
	| 'shield'
	| 'gamepad'
	| 'folder'
	| 'user'
	| 'shopping-cart'
	| 'book'
	| 'server'
	| 'heart'
	| 'star'
	| 'key';

export type CategoryColor = 'blue' | 'indigo' | 'violet' | 'rose' | 'orange' | 'emerald' | 'cyan' | 'slate';

export interface AccountCategory {
	id: string;
	name: string;
	icon: CategoryIcon;
	color: CategoryColor;
	sortOrder: number;
	isSystem: boolean;
	createdAt: string;
}
