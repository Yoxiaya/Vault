import { Animated, View, StyleSheet } from 'react-native';
import { useEffect } from 'react';

export const SkeletonItem = () => {
	const animatedValue = new Animated.Value(0.3);

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(animatedValue, {
					toValue: 0.7,
					duration: 800,
					useNativeDriver: true,
				}),
				Animated.timing(animatedValue, {
					toValue: 0.3,
					duration: 800,
					useNativeDriver: true,
				}),
			]),
		).start();
	}, []);

	const opacity = animatedValue;

	return (
		<View style={styles.accountItem}>
			<View style={styles.accountInfo}>
				<Animated.View style={[styles.skeletonLogo, { opacity }]} />
				<View style={styles.accountDetails}>
					<Animated.View style={[styles.skeletonText, { width: 120, height: 18, opacity }]} />
					<Animated.View style={[styles.skeletonText, { width: 80, height: 14, marginTop: 8, opacity }]} />
				</View>
			</View>
			<View style={styles.accountActions}>
				<Animated.View style={[styles.skeletonIcon, { opacity }]} />
			</View>
		</View>
	);
};
const styles = StyleSheet.create({
	accountActions: {
		flexDirection: 'row',
		gap: 8,
	},
	accountDetails: {
		justifyContent: 'center',
	},
	accountItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#f3f4f6',
		borderRadius: 12,
		padding: 20,
	},
	accountInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 20,
	},
	// 骨架屏样式
	skeletonLogo: {
		width: 48,
		height: 48,
		borderRadius: 8,
		backgroundColor: '#e5e7eb',
	},
	skeletonText: {
		backgroundColor: '#e5e7eb',
		borderRadius: 4,
	},
	skeletonIcon: {
		width: 36,
		height: 36,
		borderRadius: 20,
		backgroundColor: '#e5e7eb',
	},
});
