import React from 'react';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, useAppTheme } from '../theme';

interface AppHeaderProps {
	onAddAccount?: () => void;
}

export default function AppHeader({ onAddAccount }: AppHeaderProps) {
	const insets = useSafeAreaInsets();
	const { colors: themeColors, isDark, preset } = useAppTheme();

	return (
		<>
			<StatusBar
				barStyle={isDark ? 'light-content' : 'dark-content'}
				backgroundColor={themeColors.surface}
				translucent={false}
			/>
			<View
				style={[
					styles.header,
					{
						paddingTop: insets.top + 8,
						backgroundColor: themeColors.surface,
						borderBottomColor: themeColors.border,
					},
				]}
			>
				<View style={styles.content}>
					<View style={styles.brand} accessibilityLabel="猫娘密码库">
						<Image
							source={
								preset === 'mint'
									? require('../../assets/vault-mark-mint.svg')
									: require('../../assets/vault-mark.svg')
							}
							style={styles.logo}
							contentFit="contain"
						/>
						<View>
							<Text style={[styles.brandName, { color: themeColors.primary }]}>猫娘密码库</Text>
							<Text style={[styles.caption, { color: themeColors.muted }]}>你的私人密码空间</Text>
						</View>
					</View>
					{onAddAccount ? (
						<TouchableOpacity
							accessibilityLabel="添加账户"
							style={[styles.addButton, { backgroundColor: themeColors.primary }]}
							onPress={onAddAccount}
						>
							<Ionicons name="add" size={25} color="#FFFFFF" />
						</TouchableOpacity>
					) : (
						<View style={styles.rightPlaceholder} />
					)}
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	header: {
		paddingHorizontal: 18,
		paddingBottom: 10,
		backgroundColor: '#F5F7FB',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#E8ECF3',
		zIndex: 10,
	},
	content: {
		minHeight: 44,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
	logo: { width: 42, height: 42 },
	brandName: { color: colors.primary, fontSize: 22, fontFamily: fonts.brand, letterSpacing: -0.5 },
	caption: { color: colors.muted, fontSize: 11, marginTop: 1 },
	addButton: {
		width: 44,
		height: 44,
		borderRadius: 15,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.primary,
		shadowColor: colors.primary,
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.25,
		shadowRadius: 10,
		elevation: 4,
	},
	rightPlaceholder: { width: 44, height: 44 },
});
