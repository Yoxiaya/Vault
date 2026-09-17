import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemePreset, useThemeStore } from '../store';
import { ThemeColors, useAppTheme } from '../theme';

const themeOptions: Array<{
	preset: ThemePreset;
	label: string;
	description: string;
	icon: keyof typeof Ionicons.glyphMap;
	palette: [string, string, string];
}> = [
	{
		preset: 'blue',
		label: '经典蓝',
		description: '明亮清爽的默认浅色主题',
		icon: 'water-outline',
		palette: ['#3B82F6', '#E7EFFF', '#FFFFFF'],
	},
	{
		preset: 'obsidian',
		label: '曜石黑',
		description: '低亮度、专注舒适的深色主题',
		icon: 'moon-outline',
		palette: ['#6699FF', '#182230', '#0B1220'],
	},
	{
		preset: 'mint',
		label: '薄荷绿',
		description: '柔和自然的绿色浅色主题',
		icon: 'leaf-outline',
		palette: ['#2F7F6C', '#DDF2EB', '#FFFFFF'],
	},
	{
		preset: 'system',
		label: '跟随系统',
		description: '亮色使用经典蓝，暗色使用曜石黑',
		icon: 'phone-portrait-outline',
		palette: ['#3B82F6', '#FFFFFF', '#182230'],
	},
];

export default function ThemeSettingsPage() {
	const { colors } = useAppTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const preset = useThemeStore((state) => state.preset);
	const setPreset = useThemeStore((state) => state.setPreset);

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<Text style={styles.hint}>选择后立即应用到整个应用，并自动保存。</Text>
			{themeOptions.map((option) => {
				const selected = preset === option.preset;
				return (
					<TouchableOpacity
						key={option.preset}
						activeOpacity={0.8}
						style={[styles.option, selected && styles.optionSelected]}
						onPress={() => void setPreset(option.preset)}
						accessibilityRole="radio"
						accessibilityState={{ checked: selected }}
					>
						<View style={[styles.icon, selected && styles.iconSelected]}>
							<Ionicons name={option.icon} size={24} color={selected ? colors.primary : colors.muted} />
						</View>
						<View style={styles.main}>
							<View style={styles.titleRow}>
								<Text style={[styles.title, selected && styles.titleSelected]}>{option.label}</Text>
								<View style={styles.palette}>
									{option.palette.map((color, index) => (
										<View key={`${color}-${index}`} style={[styles.colorDot, { backgroundColor: color }]} />
									))}
								</View>
							</View>
							<Text style={styles.description}>{option.description}</Text>
						</View>
						<View style={[styles.radio, selected && styles.radioSelected]}>
							{selected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
						</View>
					</TouchableOpacity>
				);
			})}
		</ScrollView>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { flex: 1, backgroundColor: colors.page },
		content: { padding: 16, paddingBottom: 40, gap: 12 },
		hint: { color: colors.muted, fontSize: 13, lineHeight: 19, marginHorizontal: 4, marginBottom: 2 },
		option: {
			minHeight: 92,
			padding: 15,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 13,
			borderRadius: 18,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.card,
		},
		optionSelected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primarySoft },
		icon: {
			width: 48,
			height: 48,
			borderRadius: 15,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.page,
		},
		iconSelected: { backgroundColor: colors.card },
		main: { flex: 1, gap: 6 },
		titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
		title: { color: colors.text, fontSize: 16, fontWeight: '700' },
		titleSelected: { color: colors.primary },
		description: { color: colors.muted, fontSize: 12, lineHeight: 18 },
		palette: { flexDirection: 'row', alignItems: 'center' },
		colorDot: { width: 17, height: 17, borderRadius: 9, marginLeft: -3, borderWidth: 1, borderColor: colors.border },
		radio: {
			width: 24,
			height: 24,
			borderRadius: 12,
			borderWidth: 2,
			borderColor: colors.border,
			alignItems: 'center',
			justifyContent: 'center',
		},
		radioSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
	});
