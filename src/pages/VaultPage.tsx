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

// 分类映射：中文分类名 -> 英文分类值（根据你的数据结构调整）
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
					<Ionicons name="add-circle-outline" size={24} color="#3b82f6" />
				</TouchableOpacity>
			),
		});
	}, [navigation]);

	useEffect(() => {
		fetchAccounts();
	}, []);

	// 筛选账户：根据搜索关键词和分类
	const filteredAccounts = useMemo(() => {
		let filtered = [...accounts];

		// 按分类筛选
		if (activeCategory !== '全部') {
			const categoryValue = categoryMap[activeCategory];
			filtered = filtered.filter((account) => account.category === categoryValue);
		}

		// 按搜索关键词筛选（搜索应用名称或用户名）
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter(
				(account) =>
					account.appName.toLowerCase().includes(query) || account.username.toLowerCase().includes(query),
			);
		}

		return filtered;
	}, [accounts, searchQuery, activeCategory]);

	const onAddAccountPress = () => {
		navigation.navigate('EditAccount', { id: '', mode: 'add' });
	};

	// 清空搜索
	const onClearSearch = () => {
		setSearchQuery('');
	};

	// 渲染内容：骨架屏或账户列表
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
					<Ionicons name="search-outline" size={64} color="#d1d5db" />
					<Text style={styles.emptyTitle}>暂无账户</Text>
					<Text style={styles.emptyDescription}>
						{searchQuery || activeCategory !== '全部'
							? '没有找到匹配的账户，试试其他关键词吧'
							: '点击右上角按钮添加第一个账户'}
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
						onPress={() => navigation.navigate('AccountDetails', { id: account.id, mode: 'edit' })}
					>
						<View style={styles.accountInfo}>
							<View style={[styles.logoContainer, !account.logoUrl && styles.logoPlaceholder]}>
								{account.logoUrl ? (
									<Image source={{ uri: account.logoUrl }} style={styles.logo} />
								) : (
									<Text style={styles.logoText}>{account.appName[0]}</Text>
								)}
							</View>
							<View style={styles.accountDetails}>
								<Text style={styles.accountName}>{account.appName}</Text>
								<Text style={styles.accountUsername}>{account.username}</Text>
							</View>
						</View>
						<View style={styles.accountActions}>
							<TouchableOpacity style={styles.actionButton}>
								<Ionicons name="chevron-forward" size={20} color="#3b82f6" />
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
				))}
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.searchSection}>
				<View style={styles.searchContainer}>
					<Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
					<TextInput
						placeholder="搜索应用名称或用户名..."
						style={styles.searchInput}
						value={searchQuery}
						onChangeText={setSearchQuery}
						returnKeyType="search"
						clearButtonMode="while-editing"
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
							style={[
								styles.categoryButton,
								activeCategory === cat ? styles.activeCategoryButton : styles.inactiveCategoryButton,
							]}
						>
							<Text
								style={[
									styles.categoryText,
									activeCategory === cat ? styles.activeCategoryText : styles.inactiveCategoryText,
								]}
							>
								{cat}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

			{/* 搜索结果提示 */}
			{!loading && (searchQuery || activeCategory !== '全部') && filteredAccounts.length > 0 && (
				<View style={styles.resultInfo}>
					<Text style={styles.resultInfoText}>找到 {filteredAccounts.length} 个账户</Text>
					{(searchQuery || activeCategory !== '全部') && (
						<TouchableOpacity
							onPress={() => {
								setSearchQuery('');
								setActiveCategory('全部');
							}}
						>
							<Text style={styles.clearFilterText}>清除筛选</Text>
						</TouchableOpacity>
					)}
				</View>
			)}

			<View style={styles.accountSection}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>
						{searchQuery || activeCategory !== '全部' ? '搜索结果' : '最近使用的账户'}
					</Text>
				</View>
				<ScrollView showsVerticalScrollIndicator={false}>{renderContent()}</ScrollView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f9fafb',
	},
	searchSection: {
		padding: 16,
		gap: 24,
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f3f4f6',
		borderRadius: 12,
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
		paddingRight: 16,
		gap: 12,
	},
	categoryButton: {
		paddingHorizontal: 24,
		paddingVertical: 10,
		borderRadius: 12,
	},
	activeCategoryButton: {
		backgroundColor: '#3b82f6',
	},
	inactiveCategoryButton: {
		backgroundColor: '#f3f4f6',
	},
	categoryText: {
		fontSize: 14,
		fontWeight: '500',
	},
	activeCategoryText: {
		color: 'white',
	},
	inactiveCategoryText: {
		color: '#4b5563',
	},
	accountSection: {
		paddingHorizontal: 16,
		flex: 1,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '500',
		color: '#1f2937',
	},
	showAllText: {
		fontSize: 14,
		color: '#6b7280',
	},
	accountList: {
		gap: 12,
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
	logoContainer: {
		width: 48,
		height: 48,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	logoPlaceholder: {
		backgroundColor: 'rgba(59, 130, 246, 0.1)',
	},
	logo: {
		width: 32,
		height: 32,
		resizeMode: 'contain',
	},
	logoText: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#3b82f6',
	},
	accountDetails: {
		justifyContent: 'center',
	},
	accountName: {
		fontSize: 18,
		fontWeight: '500',
		color: '#1f2937',
	},
	accountUsername: {
		fontSize: 14,
		color: '#6b7280',
	},
	accountActions: {
		flexDirection: 'row',
		gap: 8,
	},
	actionButton: {
		padding: 8,
		borderRadius: 20,
	},
	addAccountButton: {
		padding: 12,
		borderRadius: 24,
		marginRight: 12,
	},
	// 空状态样式
	emptyContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 48,
		gap: 12,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#4b5563',
		marginTop: 8,
	},
	emptyDescription: {
		fontSize: 14,
		color: '#9ca3af',
		textAlign: 'center',
		paddingHorizontal: 32,
	},
	// 搜索结果信息
	resultInfo: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingBottom: 12,
		marginTop: -8,
	},
	resultInfoText: {
		fontSize: 13,
		color: '#6b7280',
	},
	clearFilterText: {
		fontSize: 13,
		color: '#3b82f6',
		fontWeight: '500',
	},
});
