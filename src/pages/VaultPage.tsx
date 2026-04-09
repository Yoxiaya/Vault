import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_ACCOUNTS } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type VaultPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function VaultPage() {
	const navigation = useNavigation<VaultPageNavigationProp>();
	const [searchQuery, setSearchQuery] = useState('');
	const [activeCategory, setActiveCategory] = useState('全部');

	const categories = ['全部', '社交媒体', '金融财务', '工作办公'];

	const filteredAccounts = MOCK_ACCOUNTS.filter((account) => {
		const matchesSearch =
			account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			account.username.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory =
			activeCategory === '全部' ||
			(activeCategory === '社交媒体' && account.category === 'social') ||
			(activeCategory === '金融财务' && account.category === 'finance') ||
			(activeCategory === '工作办公' && account.category === 'work');
		return matchesSearch && matchesCategory;
	});
	const onAddAccountPress = () => {
		navigation.navigate('EditAccount', { id: '', mode: 'add' });
	};

	return (
		<View style={styles.container}>
			<View style={styles.searchSection}>
				<View style={styles.searchContainer}>
					<Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
					<TextInput
						placeholder="搜索账户..."
						style={styles.searchInput}
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
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

			{/* Account List */}
			<View style={styles.accountSection}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>最近使用的账户</Text>
					<TouchableOpacity>
						<Text style={styles.showAllText}>显示全部</Text>
					</TouchableOpacity>
				</View>
				<ScrollView showsVerticalScrollIndicator={false}>
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
											<Text style={styles.logoText}>{account.name[0]}</Text>
										)}
									</View>
									<View style={styles.accountDetails}>
										<Text style={styles.accountName}>{account.name}</Text>
										<Text style={styles.accountUsername}>{account.username}</Text>
									</View>
								</View>
								<View style={styles.accountActions}>
									<TouchableOpacity style={styles.actionButton}>
										<Ionicons name="copy-outline" size={20} color="#3b82f6" />
									</TouchableOpacity>
									<TouchableOpacity style={styles.actionButton}>
										<Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
									</TouchableOpacity>
								</View>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>
			</View>

			{/* FAB */}
			<TouchableOpacity style={styles.fab} onPress={onAddAccountPress}>
				<Ionicons name="add" size={24} color="white" />
			</TouchableOpacity>
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
	fab: {
		position: 'absolute',
		bottom: 28,
		right: 24,
		width: 56,
		height: 56,
		backgroundColor: '#3b82f6',
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
});
