import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../../theme';

export function VaultOverview({ accountCount }: { accountCount: number }) {
	const { colors, isDark, preset } = useAppTheme();
	const showMintMascot = preset === 'mint';

	return (
		<View style={[styles.card, { backgroundColor: isDark ? colors.primarySoft : colors.primary }]}>
			<View style={styles.glowLarge} />
			<View style={styles.glowSmall} />
			{showMintMascot ? (
				<>
					<View style={styles.mascotHalo} />
					<Image
						source={require('../../../../assets/mascot-mint-shield.png')}
						style={styles.mascot}
						resizeMode="contain"
						accessibilityLabel="抱着盾牌的猫娘看板娘"
					/>
				</>
			) : (
				<View style={styles.icon}>
					<Ionicons name="shield-checkmark" size={23} color="#FFFFFF" />
				</View>
			)}
			<Text style={styles.eyebrow}>已安全保存</Text>
			<View style={styles.countRow}>
				<Text style={styles.count}>{accountCount}</Text>
				<Text style={styles.unit}>个账户</Text>
			</View>
			<Text style={styles.description}>敏感信息仅在此设备解密</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	card: { minHeight: 164, borderRadius: 26, padding: 22, overflow: 'hidden' },
	glowLarge: {
		position: 'absolute',
		width: 190,
		height: 190,
		borderRadius: 95,
		backgroundColor: 'rgba(255,255,255,0.10)',
		right: -55,
		top: -75,
	},
	glowSmall: {
		position: 'absolute',
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: 'rgba(255,255,255,0.08)',
		right: 65,
		bottom: -55,
	},
	icon: {
		position: 'absolute',
		right: 22,
		bottom: 22,
		width: 48,
		height: 48,
		borderRadius: 17,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.18)',
	},
	mascotHalo: {
		position: 'absolute',
		right: -20,
		bottom: -44,
		width: 190,
		height: 190,
		borderRadius: 95,
		backgroundColor: 'rgba(255,255,255,0.14)',
	},
	mascot: {
		position: 'absolute',
		right: -2,
		bottom: -10,
		width: 150,
		height: 150,
	},
	eyebrow: { color: 'rgba(255,255,255,0.76)', fontSize: 13, fontWeight: '600' },
	countRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 8 },
	count: { color: '#FFFFFF', fontSize: 48, lineHeight: 56, fontWeight: '800', letterSpacing: -2 },
	unit: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
	description: { color: 'rgba(255,255,255,0.78)', fontSize: 13, marginTop: 5 },
});
