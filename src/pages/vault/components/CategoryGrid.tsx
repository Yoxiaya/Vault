import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, useAppTheme } from '../../../theme';
import { COLLAPSED_CATEGORY_COUNT } from '../hooks/useVaultHome';
import { VaultCategoryItem } from '../types';

interface CategoryGridProps {
	categories: VaultCategoryItem[];
	totalCategoryCount: number;
	activeCategory: string;
	expanded: boolean;
	hasMore: boolean;
	onSelect: (id: string) => void;
	onToggleExpanded: () => void;
	onManage: () => void;
}

export function CategoryGrid({
	categories,
	totalCategoryCount,
	activeCategory,
	expanded,
	hasMore,
	onSelect,
	onToggleExpanded,
	onManage,
}: CategoryGridProps) {
	const { colors: themeColors } = useAppTheme();
	return (
		<>
			<View style={styles.heading}>
				<View>
					<Text style={[styles.title, { color: themeColors.text }]}>分类空间</Text>
					<Text style={[styles.subtitle, { color: themeColors.muted }]}>快速进入你的账户集合</Text>
				</View>
				<TouchableOpacity style={styles.manageButton} onPress={onManage}>
					<Text style={[styles.manageText, { color: themeColors.primary }]}>管理</Text>
					<Ionicons name="chevron-forward" size={15} color={themeColors.primary} />
				</TouchableOpacity>
			</View>

			<View style={styles.grid}>
				{categories.map((category) => {
					const selected = category.id === activeCategory;
					return (
						<TouchableOpacity
							key={category.id}
							accessibilityState={{ selected }}
							style={[
								styles.tile,
								{ backgroundColor: themeColors.surface, borderColor: themeColors.border },
								selected && [
									styles.tileActive,
									{ backgroundColor: themeColors.primary, borderColor: themeColors.primary },
								],
							]}
							onPress={() => onSelect(category.id)}
						>
							<View
								style={[styles.icon, { backgroundColor: selected ? '#FFFFFF' : `${category.color}18` }]}
							>
								<Ionicons
									name={category.icon}
									size={21}
									color={selected ? themeColors.primary : category.color}
								/>
							</View>
							<Text
								numberOfLines={1}
								style={[styles.name, { color: themeColors.text }, selected && styles.nameActive]}
							>
								{category.name}
							</Text>
							<Text style={[styles.count, { color: themeColors.muted }, selected && styles.countActive]}>
								{category.count} 项
							</Text>
						</TouchableOpacity>
					);
				})}
				{hasMore ? (
					<TouchableOpacity
						style={[styles.tile, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
						onPress={onToggleExpanded}
					>
						<View style={[styles.icon, { backgroundColor: themeColors.card }]}>
							<Ionicons
								name={expanded ? 'chevron-up' : 'ellipsis-horizontal'}
								size={21}
								color={themeColors.muted}
							/>
						</View>
						<Text style={[styles.name, { color: themeColors.text }]}>{expanded ? '收起' : '更多'}</Text>
						<Text style={[styles.count, { color: themeColors.muted }]}>
							{expanded ? '精简显示' : `${totalCategoryCount - COLLAPSED_CATEGORY_COUNT} 个`}
						</Text>
					</TouchableOpacity>
				) : null}
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
	title: { color: colors.text, fontSize: 20, fontFamily: fonts.brand },
	subtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
	manageButton: { minHeight: 40, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 2 },
	manageText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
	grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
	tile: {
		width: '23%',
		minHeight: 112,
		paddingVertical: 12,
		paddingHorizontal: 5,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 19,
		borderWidth: 1,
		borderColor: '#E8ECF3',
		backgroundColor: '#FFFFFF',
	},
	tileActive: {
		borderColor: colors.primary,
		backgroundColor: colors.primary,
		shadowColor: colors.primary,
		shadowOpacity: 0.2,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 3,
	},
	icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
	moreIcon: { backgroundColor: '#F1F5F9' },
	name: { maxWidth: '100%', color: colors.text, fontSize: 12, fontWeight: '600' },
	nameActive: { color: '#FFFFFF' },
	count: { color: '#98A2B3', fontSize: 10, marginTop: 3 },
	countActive: { color: 'rgba(255,255,255,0.72)' },
});
