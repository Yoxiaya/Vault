import React, { useMemo } from 'react';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Account, AccountCategory } from '../../../type';
import { categoryColorMap } from '../../../constants/category';
import { fonts, ThemeColors, useAppTheme } from '../../../theme';
import { SkeletonItem } from '../../../components/SkeletonItem';

interface AccountListProps {
	accounts: Account[];
	categories: AccountCategory[];
	loading: boolean;
	hasFilters: boolean;
	activeCategoryName: string;
	onClearFilters: () => void;
	onAddAccount: () => void;
	onOpenAccount: (account: Account) => void;
}

export function AccountList({
	accounts,
	categories,
	loading,
	hasFilters,
	activeCategoryName,
	onClearFilters,
	onAddAccount,
	onOpenAccount,
}: AccountListProps) {
	const { colors } = useAppTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	return (
		<>
			<View style={styles.heading}>
				<View>
					<Text style={styles.title}>{activeCategoryName}账户</Text>
					<Text style={styles.subtitle}>{loading ? '正在加载' : `共 ${accounts.length} 项`}</Text>
				</View>
				{hasFilters ? (
					<TouchableOpacity style={styles.resetButton} onPress={onClearFilters}>
						<Ionicons name="refresh" size={15} color={colors.primary} />
						<Text style={styles.resetText}>重置</Text>
					</TouchableOpacity>
				) : null}
			</View>

			{loading && accounts.length === 0 ? (
				<View style={styles.list}>
					{[1, 2, 3, 4].map((item) => (
						<SkeletonItem key={item} />
					))}
				</View>
			) : accounts.length === 0 ? (
				<View style={styles.emptyCard}>
					<View style={styles.emptyIcon}>
						<Ionicons
							name={hasFilters ? 'search-outline' : 'key-outline'}
							size={30}
							color={colors.primary}
						/>
					</View>
					<Text style={styles.emptyTitle}>{hasFilters ? '没有找到匹配的账户' : '开始建立你的密码库'}</Text>
					<Text style={styles.emptyDescription}>
						{hasFilters ? '试试其他关键词或分类' : '添加第一个账户，敏感信息将在本机加密'}
					</Text>
					{!hasFilters ? (
						<TouchableOpacity style={styles.emptyAction} onPress={onAddAccount}>
							<Ionicons name="add" size={19} color="#FFFFFF" />
							<Text style={styles.emptyActionText}>添加账户</Text>
						</TouchableOpacity>
					) : null}
				</View>
			) : (
				<View style={styles.list}>
					{accounts.map((account) => {
						const category = categories.find((item) => item.id === account.categoryId);
						return (
							<TouchableOpacity
								key={account.id}
								style={styles.item}
								activeOpacity={0.75}
								onPress={() => onOpenAccount(account)}
							>
								<View style={[styles.logo, !account.logoUrl && styles.logoFallback]}>
									{account.logoUrl ? (
										<Image
											source={{ uri: account.logoUrl }}
											style={styles.logoImage}
											contentFit="cover"
										/>
									) : (
										<Text style={styles.logoLetter}>
											{account.appName.charAt(0).toUpperCase() || '?'}
										</Text>
									)}
								</View>
								<View style={styles.main}>
									<View style={styles.titleRow}>
										<Text numberOfLines={1} style={styles.accountName}>
											{account.appName}
										</Text>
										{category ? (
											<View
												style={[
													styles.badge,
													{ backgroundColor: `${categoryColorMap[category.color]}14` },
												]}
											>
												<Text
													style={[
														styles.badgeText,
														{ color: categoryColorMap[category.color] },
													]}
												>
													{category.name}
												</Text>
											</View>
										) : null}
									</View>
									<Text numberOfLines={1} style={styles.username}>
										{account.username}
									</Text>
								</View>
								<View style={styles.arrow}>
									<Ionicons name="chevron-forward" size={18} color="#98A2B3" />
								</View>
							</TouchableOpacity>
						);
					})}
				</View>
			)}
		</>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 },
		title: { color: colors.text, fontSize: 20, fontFamily: fonts.brand },
		subtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
		resetButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
		resetText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
		list: { gap: 11 },
		item: {
			minHeight: 78,
			padding: 13,
			flexDirection: 'row',
			alignItems: 'center',
			borderRadius: 19,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.surface,
		},
		logo: {
			width: 50,
			height: 50,
			borderRadius: 15,
			overflow: 'hidden',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.card,
			borderWidth: 1,
			borderColor: colors.border,
		},
		logoFallback: { backgroundColor: colors.primarySoft, borderColor: colors.border },
		logoImage: { width: '100%', height: '100%' },
		logoLetter: { color: colors.primary, fontSize: 19, fontWeight: '700' },
		main: { flex: 1, marginLeft: 13, gap: 5 },
		titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
		accountName: { flexShrink: 1, color: colors.text, fontSize: 15, fontWeight: '700' },
		username: { color: colors.muted, fontSize: 12 },
		badge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
		badgeText: { fontSize: 9, fontWeight: '700' },
		arrow: {
			width: 34,
			height: 34,
			borderRadius: 12,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.card,
			marginLeft: 7,
		},
		emptyCard: {
			alignItems: 'center',
			paddingHorizontal: 24,
			paddingVertical: 40,
			borderRadius: 22,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.surface,
		},
		emptyIcon: {
			width: 62,
			height: 62,
			borderRadius: 20,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.primarySoft,
			marginBottom: 16,
		},
		emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
		emptyDescription: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 7 },
		emptyAction: {
			minHeight: 46,
			marginTop: 18,
			paddingHorizontal: 19,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			borderRadius: 15,
			backgroundColor: colors.primary,
		},
		emptyActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
	});
