import { useColorScheme } from 'react-native';
import { useThemeStore } from './store/useThemeStore';

export const lightColors = {
	background: '#F8FAFC',
	page: '#EEF2F7',
	surface: '#FFFFFF',
	card: '#FFFFFF',
	brand: '#1D4ED7',
	text: '#182230',
	muted: '#667085',
	primary: '#3B82F6',
	primarySoft: '#E7EFFF',
	border: '#D5DDEA',
};

export type ThemeColors = typeof lightColors;

export const darkColors: ThemeColors = {
	background: '#101828',
	page: '#0B1220',
	surface: '#182230',
	card: '#1D2939',
	brand: '#84ADFF',
	text: '#F2F4F7',
	muted: '#98A2B3',
	primary: '#6699FF',
	primarySoft: '#203A66',
	border: '#344054',
};

export const mintLightColors: ThemeColors = {
	background: '#F7FBF9',
	page: '#EEF7F3',
	surface: '#FFFFFF',
	card: '#FFFFFF',
	brand: '#276C5D',
	text: '#1D332E',
	muted: '#667B75',
	primary: '#2F7F6C',
	primarySoft: '#DDF2EB',
	border: '#C8DDD6',
};

export const colors = lightColors;

export function useAppTheme() {
	const preset = useThemeStore((state) => state.preset);
	const systemScheme = useColorScheme();
	const isDark = preset === 'obsidian' || (preset === 'system' && systemScheme === 'dark');
	const colors = preset === 'mint' ? mintLightColors : isDark ? darkColors : lightColors;
	return { colors, isDark, preset };
}

export const fonts = {
	brand: 'ZCOOLKuaiLe_400Regular',
};

export const cardStyles = {
	base: {
		backgroundColor: colors.card,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.border,
	},
	surface: {
		backgroundColor: colors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.border,
	},
};
