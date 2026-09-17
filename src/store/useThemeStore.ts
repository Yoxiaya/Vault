import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type ThemePreset = 'blue' | 'obsidian' | 'mint' | 'system';

const PRESET_STORAGE_KEY = 'vault:theme-preset';
const THEME_STORAGE_KEY = 'vault:theme-mode';
const ACCENT_STORAGE_KEY = 'vault:theme-accent';

interface ThemeStore {
	preset: ThemePreset;
	hydrated: boolean;
	hydrate: () => Promise<void>;
	setPreset: (preset: ThemePreset) => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set) => ({
	preset: 'system',
	hydrated: false,
	hydrate: async () => {
		try {
			const [storedPreset, storedMode, storedAccent] = await Promise.all([
				AsyncStorage.getItem(PRESET_STORAGE_KEY),
				AsyncStorage.getItem(THEME_STORAGE_KEY),
				AsyncStorage.getItem(ACCENT_STORAGE_KEY),
			]);
			if (storedPreset === 'blue' || storedPreset === 'obsidian' || storedPreset === 'mint' || storedPreset === 'system') {
				set({ preset: storedPreset });
			} else if (storedAccent === 'mint') {
				set({ preset: 'mint' });
			} else if (storedMode === 'dark') {
				set({ preset: 'obsidian' });
			} else if (storedMode === 'light') {
				set({ preset: 'blue' });
			}
		} finally {
			set({ hydrated: true });
		}
	},
	setPreset: async (preset) => {
		set({ preset });
		await AsyncStorage.setItem(PRESET_STORAGE_KEY, preset);
	},
}));
