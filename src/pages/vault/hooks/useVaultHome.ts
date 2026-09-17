import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAccountsStore, useCategoriesStore } from '../../../store';
import { categoryColorMap, categoryIconMap } from '../../../constants/category';
import { colors } from '../../../theme';
import { VaultCategoryItem } from '../types';

export const ALL_CATEGORIES = 'all';
export const UNCATEGORIZED = 'uncategorized';
export const COLLAPSED_CATEGORY_COUNT = 7;

export function useVaultHome() {
	const [searchQuery, setSearchQuery] = useState('');
	const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
	const [categoriesExpanded, setCategoriesExpanded] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);

	const { accounts, loading, fetchAccounts } = useAccountsStore();
	const { categories, loading: categoriesLoading, fetchCategories } = useCategoriesStore();

	const refresh = useCallback(async () => {
		try {
			await Promise.all([fetchAccounts(), fetchCategories()]);
		} finally {
			setInitialLoading(false);
		}
	}, [fetchAccounts, fetchCategories]);

	useFocusEffect(
		useCallback(() => {
			void refresh();
		}, [refresh])
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

	const categoryItems = useMemo<VaultCategoryItem[]>(
		() => [
			{
				id: ALL_CATEGORIES,
				name: '全部',
				icon: 'grid-outline',
				color: colors.primary,
				count: accounts.length,
			},
			...categories.map((category) => ({
				id: category.id,
				name: category.name,
				icon: categoryIconMap[category.icon],
				color: categoryColorMap[category.color],
				count: accounts.filter((account) => account.categoryId === category.id).length,
			})),
			{
				id: UNCATEGORIZED,
				name: '未分类',
				icon: 'folder-open-outline',
				color: '#64748B',
				count: accounts.filter((account) => account.categoryId === null).length,
			},
		],
		[accounts, categories]
	);

	const hasMoreCategories = categoryItems.length > COLLAPSED_CATEGORY_COUNT + 1;
	const visibleCategories = categoriesExpanded
		? categoryItems
		: categoryItems.slice(0, hasMoreCategories ? COLLAPSED_CATEGORY_COUNT : categoryItems.length);

	const filteredAccounts = useMemo(() => {
		let result = accounts;
		if (activeCategory === UNCATEGORIZED) {
			result = result.filter((account) => account.categoryId === null);
		} else if (activeCategory !== ALL_CATEGORIES) {
			result = result.filter((account) => account.categoryId === activeCategory);
		}

		const keyword = searchQuery.trim().toLowerCase();
		if (keyword) {
			result = result.filter(
				(account) =>
					account.appName.toLowerCase().includes(keyword) ||
					account.username.toLowerCase().includes(keyword) ||
					(account.webSite?.toLowerCase().includes(keyword) ?? false)
			);
		}
		return result;
	}, [accounts, activeCategory, searchQuery]);

	const clearFilters = () => {
		setSearchQuery('');
		setActiveCategory(ALL_CATEGORIES);
	};

	return {
		accounts,
		categories,
		loading,
		categoriesLoading,
		initialLoading,
		refresh,
		searchQuery,
		setSearchQuery,
		activeCategory,
		setActiveCategory,
		categoriesExpanded,
		setCategoriesExpanded,
		categoryItems,
		visibleCategories,
		hasMoreCategories,
		filteredAccounts,
		activeCategoryName: categoryItems.find((item) => item.id === activeCategory)?.name ?? '全部',
		hasFilters: activeCategory !== ALL_CATEGORIES || searchQuery.length > 0,
		clearFilters,
	};
}
