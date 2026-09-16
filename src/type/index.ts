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
