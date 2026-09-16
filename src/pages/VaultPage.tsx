import { cardStyles, colors } from '../theme';
import React, { useCallback, useEffect, useState, useMemo, useLayoutEffect } from 'react';
import { Image } from 'expo-image';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SkeletonItem } from '../components/SkeletonItem';
import { RootStackParamList } from '../App';
import { useAccountsStore, useCategoriesStore } from '../store';

type VaultPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VaultPage'>;

const ALL_CATEGORIES = 'all';
const UNCATEGORIZED = 'uncategorized';

export default function VaultPage() {
	const navigation = useNavigation<VaultPageNavigationProp>();
	const [searchQuery, setSearchQuery] = useState('');
	const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);

	const { accounts, loading, fetchAccounts } = useAccountsStore();
	const { categories, fetchCategories } = useCategoriesStore();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity
					accessibilityRole="button"
					accessibilityLabel="添加账户"
					style={styles.addAccountButton}
					onPress={onAddAccountPress}
				>
					<Ionicons name="add" size={20} color={colors.primary} />
					<Text style={styles.addLabel}>添加</Text>
				</TouchableOpacity>
			),
		});
	}, [navigation]);

	useFocusEffect(
		useCallback(() => {
			void Promise.all([fetchAccounts(), fetchCategories()]);
		}, [fetchAccounts, fetchCategories])
	);

	useEffect(() => {
		if (
			activeCategory !== ALL_CATEGORIES &&
			activeCategory !== UNCATEGORIZED &&
			!categories.some((category) => category.id === activeCategory)
		) {
			setActiveCategory(ALL_CATEGORIES);
		}
	}, [activeCategory, categories]);

	const filteredAccounts = useMemo(() => {
		let filtered = [...accounts];

		if (activeCategory === UNCATEGORIZED) {
			filtered = filtered.filter((account) => account.categoryId === null);
		} else if (activeCategory !== ALL_CATEGORIES) {
			filtered = filtered.filter((account) => account.categoryId === activeCategory);
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter(
				(account) =>
					account.appName.toLowerCase().includes(query) || account.username.toLowerCase().includes(query)
			);
		}

		return filtered;
	}, [accounts, searchQuery, activeCategory]);

	const onAddAccountPress = () => {
		navigation.navigate('EditAccount', { id: '', mode: 'add' });
	};

	const onClearSearch = () => {
		setSearchQuery('');
	};

	const renderContent = () => {
		if (loading) {
			return (
				<View style={styles.accountList}>
					{[1, 2, 3, 4, 5].map((item) => (
						<SkeletonItem key={item} />
					))}
				</View>
			);
		}

		if (filteredAccounts.length === 0) {
			return (
				<View style={styles.emptyContainer}>
					<View style={styles.emptyIconWrapper}>
						<Ionicons name="key-outline" size={48} color="#d1d5db" />
					</View>
					<Text style={styles.emptyTitle}>
						{searchQuery || activeCategory !== ALL_CATEGORIES ? '没有匹配的账户' : '你的保险库，从这里开始'}
					</Text>
					<Text style={styles.emptyDescription}>
						{searchQuery || activeCategory !== ALL_CATEGORIES
							? '没有找到匹配的账户'
							: '点击右上角 + 添加第一个账户'}
					</Text>
					{!searchQuery && activeCategory === ALL_CATEGORIES && (
						<TouchableOpacity
							accessibilityRole="button"
							style={styles.emptyAction}
							onPress={onAddAccountPress}
						>
							<Ionicons name="add" size={20} color="white" />
							<Text style={styles.emptyActionText}>添加第一个账户</Text>
						</TouchableOpacity>
					)}
				</View>
			);
		}

		return (
			<View style={styles.accountList}>
				{filteredAccounts.map((account) => (
					<TouchableOpacity
						key={account.id}
						style={styles.accountItem}
						activeOpacity={0.7}
						onPress={() => navigation.navigate('AccountDetails', { id: account.id, mode: 'edit' })}
					>
						<View style={styles.accountInfo}>
							<View style={[styles.logoContainer, !account.logoUrl && styles.logoPlaceholder]}>
								{account.logoUrl ? (
									<Image source={{ uri: account.logoUrl }} style={styles.logo} contentFit="cover" />
								) : (
									<Text style={styles.logoText}>
										{account.appName.charAt(0).toUpperCase() || '?'}
									</Text>
								)}
							</View>
							<View style={styles.accountDetails}>
								<Text numberOfLines={1} style={styles.accountName}>
									{account.appName}
								</Text>
								<Text numberOfLines={1} style={styles.accountUsername}>
									{account.username}
								</Text>
							</View>
						</View>
						<Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
					</TouchableOpacity>
				))}
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.searchSection}>
				<View style={styles.searchContainer}>
					<Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
					<TextInput
						placeholder="搜索应用或用户名"
						placeholderTextColor="#9ca3af"
						style={styles.searchInput}
						value={searchQuery}
						onChangeText={setSearchQuery}
						returnKeyType="search"
						autoCapitalize="none"
						autoCorrect={false}
						accessibilityLabel="搜索应用或用户名"
					/>
					{searchQuery.length > 0 && (
						<TouchableOpacity
							accessibilityRole="button"
							accessibilityLabel="清除搜索"
							onPress={onClearSearch}
							style={styles.clearButton}
						>
							<Ionicons name="close-circle" size={18} color="#9ca3af" />
						</TouchableOpacity>
					)}
				</View>

				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.categoryContainer}
					contentContainerStyle={styles.categoryContent}
				>
					{[
						{ id: ALL_CATEGORIES, name: '全部' },
						...categories.map((category) => ({ id: category.id, name: category.name })),
						{ id: UNCATEGORIZED, name: '未分类' },
					].map((category) => (
						<TouchableOpacity
							key={category.id}
							accessibilityRole="button"
							accessibilityState={{ selected: activeCategory === category.id }}
							onPress={() => setActiveCategory(category.id)}
							style={[
								styles.categoryButton,
								activeCategory === category.id && styles.activeCategoryButton,
							]}
						>
							<Text
								style={[
									styles.categoryText,
									activeCategory === category.id && styles.activeCategoryText,
								]}
							>
								{category.name}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

			<View style={styles.listHeading}>
				<Text style={styles.listTitle}>
					保险库{' '}
					<Text style={styles.resultInfoText}>
						{' '}
						/ {loading ? '加载中' : `${filteredAccounts.length} 个账户`}
					</Text>
				</Text>
				{searchQuery || activeCategory !== ALL_CATEGORIES ? (
					<TouchableOpacity
						accessibilityRole="button"
						style={styles.resetButton}
						onPress={() => {
							setSearchQuery('');
							setActiveCategory(ALL_CATEGORIES);
						}}
					>
						<Text style={styles.clearFilterText}>清除筛选</Text>
					</TouchableOpacity>
				) : null}
			</View>
			<View style={styles.accountSection}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={styles.scrollContent}
				>
					{renderContent()}
				</ScrollView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	resetButton: { minHeight: 44, justifyContent: 'center' },
	emptyAction: {
		flexDirection: 'row',
		gap: 8,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 48,
		paddingHorizontal: 20,
		borderRadius: 24,
		backgroundColor: colors.primary,
		marginTop: 12,
	},
	emptyActionText: { color: 'white', fontSize: 15, fontWeight: '600' },
	addLabel: { color: colors.primary, fontSize: 14, fontWeight: '600' },
	listHeading: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		minHeight: 48,
		paddingVertical: 4,
	},
	listTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	searchSection: {
		paddingHorizontal: 20,
		paddingTop: 12,
		paddingBottom: 8,
		gap: 16,
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.card,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		paddingLeft: 16,
		paddingRight: 4,
		minHeight: 50,
	},
	searchIcon: {
		marginRight: 12,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: colors.text,
	},
	clearButton: {
		minWidth: 44,
		minHeight: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	categoryContainer: {
		flexDirection: 'row',
	},
	categoryContent: {
		paddingRight: 20,
		gap: 10,
	},
	categoryButton: {
		paddingHorizontal: 18,
		minHeight: 44,
		justifyContent: 'center',
		borderRadius: 22,
		backgroundColor: colors.card,
		borderWidth: 1,
		borderColor: colors.border,
	},
	activeCategoryButton: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	categoryText: {
		fontSize: 14,
		fontWeight: '500',
		color: '#6b7280',
	},
	activeCategoryText: {
		color: '#FFFFFF',
		fontWeight: '600',
	},
	accountSection: {
		flex: 1,
		paddingHorizontal: 20,
	},
	scrollContent: {
		paddingBottom: 20,
	},
	resultInfoText: {
		fontSize: 13,
		color: colors.muted,
	},
	clearFilterText: {
		fontSize: 13,
		color: '#3b82f6',
		fontWeight: '500',
	},
	accountList: {
		gap: 12,
	},
	accountItem: {
		...cardStyles.base,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 16,
		minHeight: 84,
	},
	accountInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14,
		flex: 1,
	},
	logoContainer: {
		width: 48,
		height: 48,
		borderRadius: 12,
		overflow: 'hidden',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#ffffff',
		borderWidth: 0.5,
		borderColor: '#e5e7eb',
	},
	logoPlaceholder: {
		backgroundColor: '#eff6ff',
		borderColor: '#dbeafe',
	},
	logo: {
		width: '100%',
		height: '100%',
	},
	logoText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#3b82f6',
	},
	accountDetails: {
		flex: 1,
		gap: 4,
	},
	accountName: {
		fontSize: 16,
		fontWeight: '600',
		color: colors.text,
	},
	accountUsername: {
		fontSize: 13,
		color: colors.muted,
	},
	addAccountButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 12,
		minHeight: 44,
		marginRight: 12,
		borderRadius: 12,
		backgroundColor: colors.primarySoft,
	},
	// 空状态
	emptyContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 80,
		gap: 12,
	},
	emptyIconWrapper: {
		width: 80,
		height: 80,
		borderRadius: 24,
		backgroundColor: colors.primarySoft,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 8,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#6b7280',
	},
	emptyDescription: {
		fontSize: 14,
		color: colors.muted,
		textAlign: 'center',
	},
});
