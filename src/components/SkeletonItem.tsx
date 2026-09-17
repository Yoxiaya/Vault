import { Animated, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useRef } from 'react';
import { ThemeColors, useAppTheme } from '../theme';

export const SkeletonItem = () => {
	const { colors } = useAppTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const animatedValue = useRef(new Animated.Value(0.3)).current;

	useEffect(() => {
		const animation = Animated.loop(
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
		);
		animation.start();
		return () => animation.stop();
	}, [animatedValue]);

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

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
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
			backgroundColor: colors.surface,
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
			backgroundColor: colors.border,
		},
		skeletonText: {
			backgroundColor: colors.border,
			borderRadius: 4,
		},
		skeletonIcon: {
			width: 36,
			height: 36,
			borderRadius: 20,
			backgroundColor: colors.border,
		},
	});
