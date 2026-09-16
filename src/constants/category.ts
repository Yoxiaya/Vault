import { Ionicons } from '@expo/vector-icons';
import { CategoryColor, CategoryIcon } from '../type';

export const categoryIconMap: Record<CategoryIcon, keyof typeof Ionicons.glyphMap> = {
	share: 'share-social-outline',
	briefcase: 'briefcase-outline',
	shield: 'shield-checkmark-outline',
	gamepad: 'game-controller-outline',
	folder: 'folder-outline',
	user: 'person-outline',
	'shopping-cart': 'cart-outline',
	book: 'book-outline',
	server: 'server-outline',
	heart: 'heart-outline',
	star: 'star-outline',
	key: 'key-outline',
};

export const categoryColorMap: Record<CategoryColor, string> = {
	blue: '#3B82F6',
	indigo: '#6366F1',
	violet: '#8B5CF6',
	rose: '#F43F5E',
	orange: '#F97316',
	emerald: '#10B981',
	cyan: '#06B6D4',
	slate: '#64748B',
};

export const categoryIcons = Object.keys(categoryIconMap) as CategoryIcon[];
export const categoryColors = Object.keys(categoryColorMap) as CategoryColor[];
