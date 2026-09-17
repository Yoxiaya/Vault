import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, useAppTheme } from '../../../theme';

interface VaultSearchProps {
	value: string;
	onChange: (value: string) => void;
}

export function VaultSearch({ value, onChange }: VaultSearchProps) {
	const { colors: themeColors, isDark } = useAppTheme();
	return (
		<View style={[styles.box, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
			<View style={[styles.iconBox, { backgroundColor: themeColors.primarySoft }]}>
				<Ionicons name="search" size={19} color={themeColors.primary} />
			</View>
			<TextInput
				style={[styles.input, { color: themeColors.text }]}
				placeholder="搜索账户、用户名或网址"
				placeholderTextColor="#98A2B3"
				value={value}
				onChangeText={onChange}
				keyboardAppearance={isDark ? 'dark' : 'light'}
				selectionColor={themeColors.primary}
				autoCapitalize="none"
				autoCorrect={false}
				returnKeyType="search"
			/>
			{value ? (
				<TouchableOpacity accessibilityLabel="清除搜索" style={styles.clear} onPress={() => onChange('')}>
					<Ionicons name="close-circle" size={20} color={themeColors.muted} />
				</TouchableOpacity>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	box: {
		minHeight: 56,
		marginTop: -4,
		paddingHorizontal: 7,
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 18,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E8ECF3',
		shadowColor: '#334155',
		shadowOpacity: 0.07,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 5 },
		elevation: 3,
	},
	iconBox: {
		width: 42,
		height: 42,
		borderRadius: 13,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.primarySoft,
	},
	input: { flex: 1, height: 54, paddingHorizontal: 13, color: colors.text, fontSize: 15 },
	clear: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
});
