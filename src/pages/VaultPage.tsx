import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AppHeader from '../components/AppHeader';
import { Account } from '../type';
import { useVaultHome } from './vault/hooks/useVaultHome';
import { VaultOverview } from './vault/components/VaultOverview';
import { VaultSearch } from './vault/components/VaultSearch';
import { CategoryGrid } from './vault/components/CategoryGrid';
import { AccountList } from './vault/components/AccountList';
import { VaultHomeSkeleton } from './vault/components/VaultHomeSkeleton';
import { useAppTheme } from '../theme';

type VaultPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VaultPage'>;

export default function VaultPage() {
	const navigation = useNavigation<VaultPageNavigationProp>();
	const home = useVaultHome();
	const { colors } = useAppTheme();

	const addAccount = () => navigation.navigate('EditAccount', { id: '', mode: 'add' });
	const openAccount = (account: Account) => navigation.navigate('AccountDetails', { id: account.id, mode: 'edit' });

	return (
		<View style={[styles.screen, { backgroundColor: colors.page }]}>
			<AppHeader onAddAccount={addAccount} />
			<ScrollView
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={styles.content}
				refreshControl={
					<RefreshControl
						refreshing={!home.initialLoading && (home.loading || home.categoriesLoading)}
						onRefresh={home.refresh}
					/>
				}
			>
				{home.initialLoading ? (
					<VaultHomeSkeleton />
				) : (
					<>
						<VaultOverview accountCount={home.accounts.length} />
						<VaultSearch value={home.searchQuery} onChange={home.setSearchQuery} />
						<CategoryGrid
							categories={home.visibleCategories}
							totalCategoryCount={home.categoryItems.length}
							activeCategory={home.activeCategory}
							expanded={home.categoriesExpanded}
							hasMore={home.hasMoreCategories}
							onSelect={home.setActiveCategory}
							onToggleExpanded={() => home.setCategoriesExpanded((expanded) => !expanded)}
							onManage={() => navigation.navigate('CategoryManagementPage')}
						/>
						<AccountList
							accounts={home.filteredAccounts}
							categories={home.categories}
							loading={home.loading}
							hasFilters={home.hasFilters}
							activeCategoryName={home.activeCategoryName}
							onClearFilters={home.clearFilters}
							onAddAccount={addAccount}
							onOpenAccount={openAccount}
						/>
					</>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: '#F5F7FB' },
	content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 112, gap: 20 },
});
