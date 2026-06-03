import React, { useEffect, useState, useMemo, useLayoutEffect } from 'react';
import { Image } from 'expo-image';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SkeletonItem } from '../components/SkeletonItem';
import { RootStackParamList } from '../App';
import { useAccountsStore } from '../store';

type VaultPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VaultPage'>;

// 分类映射
const categoryMap: Record<string, string> = {
	全部: '',
	社交: 'social',
	财务: 'finance',
	娱乐: 'entertainment',
	其他: 'other',
};

export default function VaultPage() {
	const navigation = useNavigation<VaultPageNavigationProp>();
	const [searchQuery, setSearchQuery] = useState('');
	const [activeCategory, setActiveCategory] = useState('全部');
	const categories = ['全部', '社交', '财务', '娱乐', '其他'];

	const { accounts, loading, fetchAccounts } = useAccountsStore();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity style={styles.addAccountButton} onPress={onAddAccountPress}>
					<Ionicons name="add" size={24} color="#3b82f6" />
				</TouchableOpacity>
			),
			headerStyle: {
				backgroundColor: '#ffffff',
			},
			headerTitleStyle: {
				color: '#1f2937',
				fontSize: 20,
				fontWeight: '600',
			},
		});
	}, [navigation]);

	useEffect(() => {
		fetchAccounts();
	}, []);

	const filteredAccounts = useMemo(() => {
		let filtered = [...accounts];

		if (activeCategory !== '全部') {
			const categoryValue = categoryMap[activeCategory];
			filtered = filtered.filter((account) => account.category === categoryValue);
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
					<Text style={styles.emptyTitle}>暂无账户</Text>
					<Text style={styles.emptyDescription}>
						{searchQuery || activeCategory !== '全部'
							? '没有找到匹配的账户'
							: '点击右上角 + 添加第一个账户'}
					</Text>
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
									<Image source={{ uri: account.logoUrl }} style={styles.logo} />
								) : (
									<Text style={styles.logoText}>{account.appName[0].toUpperCase()}</Text>
								)}
							</View>
							<View style={styles.accountDetails}>
								<Text style={styles.accountName}>{account.appName}</Text>
								<Text style={styles.accountUsername}>{account.username}</Text>
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
					/>
					{searchQuery.length > 0 && (
						<TouchableOpacity onPress={onClearSearch} style={styles.clearButton}>
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
					{categories.map((cat) => (
						<TouchableOpacity
							key={cat}
							onPress={() => setActiveCategory(cat)}
							style={[styles.categoryButton, activeCategory === cat && styles.activeCategoryButton]}
						>
							<Text style={[styles.categoryText, activeCategory === cat && styles.activeCategoryText]}>
								{cat}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

			{(searchQuery || activeCategory !== '全部') && filteredAccounts.length > 0 && (
				<View style={styles.resultInfo}>
					<Text style={styles.resultInfoText}>共 {filteredAccounts.length} 个账户</Text>
					<TouchableOpacity
						onPress={() => {
							setSearchQuery('');
							setActiveCategory('全部');
						}}
					>
						<Text style={styles.clearFilterText}>清除筛选</Text>
					</TouchableOpacity>
				</View>
			)}

			<View style={styles.accountSection}>
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
					{renderContent()}
				</ScrollView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
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
		backgroundColor: '#f9fafb',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		paddingHorizontal: 16,
		height: 48,
	},
	searchIcon: {
		marginRight: 12,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: '#1f2937',
	},
	clearButton: {
		padding: 4,
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
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: '#f9fafb',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	activeCategoryButton: {
		backgroundColor: '#3b82f6',
		borderColor: '#3b82f6',
	},
	categoryText: {
		fontSize: 14,
		fontWeight: '500',
		color: '#6b7280',
	},
	activeCategoryText: {
		color: '#ffffff',
	},
	accountSection: {
		flex: 1,
		paddingHorizontal: 20,
	},
	scrollContent: {
		paddingBottom: 20,
	},
	resultInfo: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 8,
	},
	resultInfoText: {
		fontSize: 13,
		color: '#9ca3af',
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
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#f9fafb',
		borderRadius: 14,
		padding: 16,
		borderWidth: 1,
		borderColor: '#f0f0f0',
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
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#ffffff',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	logoPlaceholder: {
		backgroundColor: '#eff6ff',
		borderColor: '#dbeafe',
	},
	logo: {
		width: 32,
		height: 32,
		resizeMode: 'contain',
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
		color: '#1f2937',
	},
	accountUsername: {
		fontSize: 13,
		color: '#9ca3af',
	},
	addAccountButton: {
		padding: 8,
		marginRight: 12,
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
		borderRadius: 40,
		backgroundColor: '#f9fafb',
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
		color: '#9ca3af',
		textAlign: 'center',
	},
});
