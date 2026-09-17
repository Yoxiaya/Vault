import { Ionicons } from '@expo/vector-icons';

export interface VaultCategoryItem {
	id: string;
	name: string;
	icon: keyof typeof Ionicons.glyphMap;
	color: string;
	count: number;
}
