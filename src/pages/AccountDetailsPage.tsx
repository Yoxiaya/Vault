import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MOCK_ACCOUNTS } from '../types';
import { RootStackParamList } from '../App';

type AccountDetailsPageRouteProp = RouteProp<RootStackParamList, 'AccountDetails'>;
type AccountDetailsPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AccountDetails'>;

export default function AccountDetailsPage() {
	const route = useRoute<AccountDetailsPageRouteProp>();
	const navigation = useNavigation<AccountDetailsPageNavigationProp>();
	const { id } = route.params;
	const account = MOCK_ACCOUNTS.find((a) => a.id === id);

	if (!account)
		return (
			<View style={styles.errorContainer}>
				<Text>Account not found</Text>
			</View>
		);

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			{/* Header */}
			<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
				<Ionicons name="arrow-back" size={24} color="#6b7280" />
			</TouchableOpacity>

			{/* Hero Section */}
			<View style={styles.heroSection}>
				<View style={styles.logoContainer}>
					{account.logoUrl ? (
						<Image source={{ uri: account.logoUrl }} style={styles.logo} />
					) : (
						<Text style={styles.logoText}>{account.name[0]}</Text>
					)}
				</View>
				<View style={styles.accountInfo}>
					<View style={styles.securityBadge}>
						<Ionicons name="checkmark-circle" size={14} color="#fbbf24" />
						<Text style={styles.securityBadgeText}>高安全性账号</Text>
					</View>
					<Text style={styles.accountName}>{account.name}</Text>
					<Text style={styles.accountDescription}>
						代码托管与协作平台，包含个人项目及企业级敏感仓库权限。
					</Text>
				</View>
			</View>

			{/* Details Grid */}
			<View style={styles.detailsContainer}>
				{/* Credentials Card */}
				<View style={styles.credentialsCard}>
					<Text style={styles.sectionTitle}>登录凭据</Text>
					<View style={styles.credentialsList}>
						{/* Username */}
						<View style={styles.credentialItem}>
							<Text style={styles.credentialLabel}>用户名</Text>
							<View style={styles.credentialValueContainer}>
								<Text style={styles.credentialValue}>{account.username}</Text>
								<TouchableOpacity style={styles.actionButton}>
									<Ionicons name="copy-outline" size={20} color="#3b82f6" />
								</TouchableOpacity>
							</View>
						</View>
						{/* Password */}
						<View style={styles.credentialItem}>
							<Text style={styles.credentialLabel}>密码</Text>
							<View style={styles.credentialValueContainer}>
								<Text style={styles.credentialValue}>••••••••••••••••</Text>
								<TouchableOpacity style={styles.actionButton}>
									<Ionicons name="copy-outline" size={20} color="#3b82f6" />
								</TouchableOpacity>
							</View>
							<View style={styles.passwordStrengthContainer}>
								<View style={[styles.strengthBar, styles.strengthBarDim]} />
								<View style={[styles.strengthBar, styles.strengthBarDim]} />
								<View style={[styles.strengthBar, styles.strengthBarDim]} />
								<View style={[styles.strengthBar, styles.strengthBarFull]} />
							</View>
							<Text style={styles.strengthText}>密码强度：极高</Text>
						</View>
						{/* Website */}
						<View style={styles.credentialItem}>
							<Text style={styles.credentialLabel}>官方网站</Text>
							<View style={styles.credentialValueContainer}>
								<Text style={styles.credentialValueLink}>{account.website}</Text>
								<TouchableOpacity style={styles.actionButton}>
									<Ionicons name="open-outline" size={20} color="#3b82f6" />
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</View>

				{/* Metadata Card */}
				<View style={styles.metadataCard}>
					<View style={styles.metadataItem}>
						<Text style={styles.metadataLabel}>最后更新时间</Text>
						<Text style={styles.metadataValue}>{account.lastUpdated}</Text>
					</View>
					<View style={styles.metadataItem}>
						<Text style={styles.metadataLabel}>2FA 二步验证</Text>
						<View style={styles.twoFactorContainer}>
							<View style={styles.statusDot} />
							<Text style={styles.metadataValue}>
								{account.twoFactorEnabled ? '已启用 (Enabled)' : '未启用'}
							</Text>
						</View>
					</View>
					<View style={styles.metadataItem}>
						<Text style={styles.metadataLabel}>存储库</Text>
						<Text style={styles.metadataValue}>{account.storageType}</Text>
					</View>
				</View>

				{/* Action Panel */}
				<View style={styles.actionPanel}>
					<TouchableOpacity
						style={styles.primaryButton}
						onPress={() => navigation.navigate('EditAccount', { id: account.id })}
					>
						<Ionicons name="create-outline" size={20} color="white" />
						<Text style={styles.primaryButtonText}>编辑账号详情</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.secondaryButton}>
						<Ionicons name="share-outline" size={20} color="#1f2937" />
						<Text style={styles.secondaryButtonText}>安全共享</Text>
					</TouchableOpacity>
				</View>

				{/* Danger Zone */}
				<View style={styles.dangerZone}>
					<View style={styles.dangerHeader}>
						{/*  @ts-ignore */}
						<Ionicons name="alert-triangle-outline" size={16} color="#ef4444" />
						<Text style={styles.dangerTitle}>危险区域</Text>
					</View>
					<TouchableOpacity style={styles.dangerButton}>
						<Ionicons name="trash-outline" size={20} color="#ef4444" />
						<Text style={styles.dangerButtonText}>永久删除账号</Text>
					</TouchableOpacity>
				</View>

				{/* Security Tip */}
				<View style={styles.securityTip}>
					<Text style={styles.securityTipTitle}>安全建议</Text>
					<Text style={styles.securityTipText}>
						建议定期更换您的 {account.name} 密码并确保 SSH 密钥仅在受信任的设备上使用。
					</Text>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f9fafb',
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		margin: 16,
		backgroundColor: '#f3f4f6',
	},
	heroSection: {
		padding: 16,
		alignItems: 'center',
		gap: 24,
	},
	logoContainer: {
		width: 128,
		height: 128,
		borderRadius: 12,
		backgroundColor: '#f3f4f6',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	logo: {
		width: 96,
		height: 96,
		resizeMode: 'contain',
	},
	logoText: {
		fontSize: 48,
		fontWeight: 'bold',
		color: '#3b82f6',
	},
	accountInfo: {
		alignItems: 'center',
		gap: 8,
	},
	securityBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 12,
		paddingVertical: 4,
		backgroundColor: '#fef3c7',
		borderRadius: 20,
	},
	securityBadgeText: {
		fontSize: 12,
		fontWeight: '500',
		color: '#92400e',
	},
	accountName: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#1f2937',
	},
	accountDescription: {
		fontSize: 14,
		color: '#6b7280',
		textAlign: 'center',
		maxWidth: 300,
	},
	detailsContainer: {
		padding: 16,
		gap: 16,
	},
	credentialsCard: {
		backgroundColor: '#f3f4f6',
		borderRadius: 12,
		padding: 24,
		gap: 24,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	sectionTitle: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#6b7280',
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	credentialsList: {
		gap: 24,
	},
	credentialItem: {
		gap: 8,
	},
	credentialLabel: {
		fontSize: 12,
		fontWeight: '600',
		color: '#6b7280',
	},
	credentialValueContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#f9fafb',
		padding: 16,
		borderRadius: 8,
	},
	credentialValue: {
		fontSize: 16,
		fontWeight: '500',
		color: '#1f2937',
	},
	credentialValueLink: {
		fontSize: 16,
		fontWeight: '500',
		color: '#3b82f6',
	},
	actionButton: {
		padding: 8,
		borderRadius: 20,
	},
	passwordStrengthContainer: {
		flexDirection: 'row',
		gap: 4,
		height: 4,
	},
	strengthBar: {
		flex: 1,
		borderRadius: 2,
	},
	strengthBarDim: {
		backgroundColor: 'rgba(59, 130, 246, 0.3)',
	},
	strengthBarFull: {
		backgroundColor: '#3b82f6',
	},
	strengthText: {
		fontSize: 10,
		fontWeight: '500',
		color: '#3b82f6',
		textTransform: 'uppercase',
	},
	metadataCard: {
		backgroundColor: '#f9fafb',
		borderRadius: 12,
		padding: 24,
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 32,
	},
	metadataItem: {
		gap: 4,
	},
	metadataLabel: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#6b7280',
		textTransform: 'uppercase',
	},
	metadataValue: {
		fontSize: 14,
		fontWeight: '600',
		color: '#1f2937',
	},
	twoFactorContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#3b82f6',
	},
	actionPanel: {
		gap: 12,
	},
	primaryButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		backgroundColor: '#3b82f6',
		borderRadius: 24,
		padding: 16,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5,
	},
	primaryButtonText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: 'white',
	},
	secondaryButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		backgroundColor: '#f3f4f6',
		borderRadius: 24,
		padding: 16,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	secondaryButtonText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#1f2937',
	},
	dangerZone: {
		backgroundColor: '#f3f4f6',
		borderRadius: 12,
		padding: 24,
		borderWidth: 1,
		borderColor: 'rgba(239, 68, 68, 0.1)',
		gap: 16,
	},
	dangerHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	dangerTitle: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#ef4444',
		textTransform: 'uppercase',
	},
	dangerButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		borderRadius: 24,
		padding: 12,
	},
	dangerButtonText: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#ef4444',
	},
	securityTip: {
		backgroundColor: 'rgba(59, 130, 246, 0.1)',
		borderRadius: 12,
		padding: 24,
		borderWidth: 1,
		borderColor: 'rgba(59, 130, 246, 0.2)',
		gap: 4,
	},
	securityTipTitle: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#1d4ed8',
	},
	securityTipText: {
		fontSize: 12,
		color: '#1d4ed8',
		lineHeight: 18,
	},
});
