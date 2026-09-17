import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ThemeColors, useAppTheme } from '../../../theme';

export function VaultHomeSkeleton() {
	const { colors } = useAppTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const opacity = useRef(new Animated.Value(0.45)).current;

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, { toValue: 0.9, duration: 750, useNativeDriver: true }),
				Animated.timing(opacity, { toValue: 0.45, duration: 750, useNativeDriver: true }),
			])
		);
		animation.start();
		return () => animation.stop();
	}, [opacity]);

	const block = (style: object) => <Animated.View style={[styles.block, style, { opacity }]} />;

	return (
		<View style={styles.page}>
			<View style={styles.hero}>
				{block(styles.heroLabel)}
				{block(styles.heroCount)}
				{block(styles.heroDescription)}
			</View>
			<View style={styles.search}>
				{block(styles.searchIcon)}
				{block(styles.searchText)}
			</View>
			<SectionHeadingSkeleton styles={styles} block={block} showAction />
			<View style={styles.categoryGrid}>
				{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
					<View key={item} style={styles.categoryTile}>
						{block(styles.categoryIcon)}
						{block(styles.categoryName)}
						{block(styles.categoryCount)}
					</View>
				))}
			</View>
			<SectionHeadingSkeleton styles={styles} block={block} />
			<View style={styles.accountList}>
				{[1, 2, 3, 4].map((item) => (
					<View key={item} style={styles.account}>
						{block(styles.accountLogo)}
						<View style={styles.accountContent}>
							{block(styles.accountTitle)}
							{block(styles.accountUsername)}
						</View>
						{block(styles.accountArrow)}
					</View>
				))}
			</View>
		</View>
	);
}

interface SectionHeadingSkeletonProps {
	styles: ReturnType<typeof StyleSheet.create>;
	block: (style: object) => React.ReactNode;
	showAction?: boolean;
}

function SectionHeadingSkeleton({ styles, block, showAction }: SectionHeadingSkeletonProps) {
	return (
		<View style={styles.sectionHeader}>
			<View style={styles.headingGroup}>
				{block(styles.heading)}
				{block(styles.subheading)}
			</View>
			{showAction ? block(styles.manage) : null}
		</View>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		page: { gap: 20 },
		block: { backgroundColor: colors.border, borderRadius: 8 },
		hero: {
			height: 164,
			borderRadius: 26,
			padding: 22,
			justifyContent: 'center',
			backgroundColor: colors.primarySoft,
		},
		heroLabel: { width: 82, height: 13 },
		heroCount: { width: 118, height: 48, borderRadius: 12, marginTop: 12 },
		heroDescription: { width: 170, height: 13, marginTop: 12 },
		search: {
			height: 56,
			paddingHorizontal: 7,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 13,
			borderRadius: 18,
			backgroundColor: colors.surface,
			borderWidth: 1,
			borderColor: colors.border,
		},
		searchIcon: { width: 42, height: 42, borderRadius: 13 },
		searchText: { width: '56%', height: 15 },
		sectionHeader: { minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
		headingGroup: { gap: 7 },
		heading: { width: 82, height: 18 },
		subheading: { width: 130, height: 11 },
		manage: { width: 48, height: 14 },
		categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
		categoryTile: {
			width: '23%',
			height: 112,
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: 19,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.surface,
		},
		categoryIcon: { width: 42, height: 42, borderRadius: 14, marginBottom: 9 },
		categoryName: { width: 40, height: 12 },
		categoryCount: { width: 26, height: 9, marginTop: 6 },
		accountList: { gap: 11 },
		account: {
			height: 78,
			padding: 13,
			flexDirection: 'row',
			alignItems: 'center',
			borderRadius: 19,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.surface,
		},
		accountLogo: { width: 50, height: 50, borderRadius: 15 },
		accountContent: { flex: 1, marginLeft: 13, gap: 8 },
		accountTitle: { width: '46%', height: 14 },
		accountUsername: { width: '68%', height: 11 },
		accountArrow: { width: 34, height: 34, borderRadius: 12 },
	});
