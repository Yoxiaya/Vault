import React, { useState, useEffect } from 'react';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { RootStackParamList } from '../App';
import { Account } from '../type';
import { useAccountsStore } from '../store';
import { deleteAccount, uploadAccountLogo } from '../service/api';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { useToast } from '../components/Toast';
import { cardStyles, colors } from '../theme';

type AccountDetailsPageRouteProp = RouteProp<RootStackParamList, 'AccountDetails'>;
type AccountDetailsPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AccountDetails'>;

const formatLastUpdated = (value: string | null) => {
	if (!value) return '暂无记录';

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '暂无记录';

	const pad = (number: number) => String(number).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function AccountDetailsPage() {
	const route = useRoute<AccountDetailsPageRouteProp>();
	const navigation = useNavigation<AccountDetailsPageNavigationProp>();
	const { id } = route.params;

	const toast = useToast();
	const [account, setAccount] = useState<Account>();
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [isLogoUploading, setIsLogoUploading] = useState(false);
	const { getAccountDetailById, fetchAccounts } = useAccountsStore();

	// 复制到剪贴板的通用函数
	const copyToClipboard = async (text: string, type: string) => {
		if (!text) return;
		await Clipboard.setStringAsync(text);
		toast.success('复制成功', `${type}已复制到剪贴板`);
	};

	const changeAccountLogo = async () => {
		if (isLogoUploading) return;

		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			toast.warning('需要相册权限', '请允许访问相册后再修改应用图标');
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (result.canceled || !result.assets[0]) return;

		const asset = result.assets[0];
		const formData = new FormData();
		formData.append('file', {
			uri: asset.uri,
			name: asset.fileName || `account_logo_${Date.now()}.jpg`,
			type: asset.mimeType || 'image/jpeg',
		} as any);

		setIsLogoUploading(true);
		try {
			const response = await uploadAccountLogo(id, formData);
			const logoUrl = response.data?.logoUrl;
			if (!response.success || !logoUrl) throw new Error('上传接口未返回图标地址');

			setAccount((current) => (current ? { ...current, logoUrl } : current));
			await fetchAccounts();
			toast.success('修改成功', '应用图标已更新');
		} catch (error) {
			console.error('图标上传失败:', error);
			toast.error('修改失败', '请检查网络后重试');
		} finally {
			setIsLogoUploading(false);
		}
	};

	const deleteAccountPress = () => {
		Alert.alert(
			'永久删除账号',
			`确定要永久删除账号“${account?.appName}”吗？此操作不可恢复。`,
			[
				{
					text: '取消',
					style: 'cancel',
				},
				{
					text: '确认删除',
					style: 'destructive',
					onPress: async () => {
						await deleteAccount(id);
						navigation.navigate('VaultPage');
					},
				},
			],
			{ cancelable: true }
		);
	};
	// 密码强度计算

	useEffect(() => {
		setPasswordVisible(false);
		const accountDetails = getAccountDetailById(id);
		if (accountDetails) {
			setAccount(accountDetails);
		}
	}, [id]);

	if (!account)
		return (
			<View style={styles.errorContainer}>
				<Text>Account not found</Text>
			</View>
		);

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			{/* Hero Section */}
			<View style={styles.heroSection}>
				<View style={styles.logoWrapper}>
					<View style={styles.logoContainer}>
						{account.logoUrl ? (
							<Image source={{ uri: account.logoUrl }} style={styles.logo} contentFit="cover" />
						) : (
							<Text style={styles.logoText}>{account.appName.charAt(0).toUpperCase() || '?'}</Text>
						)}
					</View>
					<TouchableOpacity
						style={styles.logoEditButton}
						onPress={changeAccountLogo}
						disabled={isLogoUploading}
						accessibilityRole="button"
						accessibilityLabel="修改应用图标"
					>
						{isLogoUploading ? (
							<Ionicons name="hourglass-outline" size={18} color="white" />
						) : (
							<Ionicons name="camera-outline" size={19} color="white" />
						)}
					</TouchableOpacity>
				</View>
				<View style={styles.accountInfo}>
					<View style={styles.securityBadge}>
						<Ionicons name="checkmark-circle" size={14} color="#fbbf24" />
						<Text style={styles.securityBadgeText}>高安全性账号</Text>
					</View>
					<Text style={styles.accountName}>{account.appName}</Text>
					{/* 动态描述：如果有 description 字段且不为空则显示 */}
					{account.description && account.description.trim() !== '' && (
						<Text style={styles.accountDescription}>{account.description}</Text>
					)}
				</View>
			</View>

			{/* Details Grid */}
			<View style={styles.detailsContainer}>
				{/* Credentials Card */}
				<View style={styles.credentialsCard}>
					<View style={styles.sectionHeader}>
						<View>
							<Text style={styles.sectionTitle}>登录凭据</Text>
							<Text style={styles.sectionSubtitle}>轻触右侧图标即可快速复制</Text>
						</View>
						<View style={styles.secureBadge}>
							<Ionicons name="shield-checkmark" size={14} color={colors.primary} />
							<Text style={styles.secureBadgeText}>加密保存</Text>
						</View>
					</View>
					<View style={styles.credentialsList}>
						{/* Username */}
						<View style={styles.credentialItem}>
							<Text style={styles.credentialLabel}>用户名</Text>
							<View style={styles.credentialValueContainer}>
								<Text numberOfLines={1} selectable style={styles.credentialValue}>
									{account.username}
								</Text>
								<TouchableOpacity
									style={styles.actionButton}
									accessibilityRole="button"
									accessibilityLabel="复制用户名"
									onPress={() => copyToClipboard(account.username, '用户名')}
								>
									<Ionicons name="copy-outline" size={20} color="#3b82f6" />
								</TouchableOpacity>
							</View>
						</View>
						{/* Password */}
						<View style={styles.credentialItem}>
							<Text style={styles.credentialLabel}>密码</Text>
							<View style={styles.credentialValueContainer}>
								<Text
									numberOfLines={1}
									selectable={passwordVisible}
									style={[styles.credentialValue, styles.passwordValue]}
								>
									{passwordVisible ? account.password : '••••••••••••••••'}
								</Text>
								<View style={styles.credentialActions}>
									<TouchableOpacity
										style={styles.actionButton}
										accessibilityRole="button"
										accessibilityLabel={passwordVisible ? '隐藏密码' : '显示密码'}
										accessibilityState={{ checked: passwordVisible }}
										onPress={() => setPasswordVisible((visible) => !visible)}
									>
										<Ionicons
											name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
											size={21}
											color={colors.primary}
										/>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.actionButton}
										accessibilityRole="button"
										accessibilityLabel="复制密码"
										onPress={() => copyToClipboard(account.password as string, '密码')}
									>
										<Ionicons name="copy-outline" size={20} color={colors.primary} />
									</TouchableOpacity>
								</View>
							</View>
							<PasswordStrengthIndicator password={account?.password || ''} showFeedback={false} />
						</View>
						{/* Website - 条件渲染：只有当 webSite 字段存在且不为空时显示 */}
						{account.webSite && account.webSite.trim() !== '' && (
							<View style={styles.credentialItem}>
								<Text style={styles.credentialLabel}>官方网站</Text>
								<View style={styles.credentialValueContainer}>
									<Text numberOfLines={1} style={styles.credentialValueLink}>
										{account.webSite}
									</Text>
									<TouchableOpacity
										style={styles.actionButton}
										accessibilityRole="button"
										accessibilityLabel="复制网址"
										onPress={() => {
											// 可以添加打开链接的逻辑，目前仅复制
											copyToClipboard(account.webSite!, '网址');
										}}
									>
										<Ionicons name="copy-outline" size={20} color="#3b82f6" />
									</TouchableOpacity>
								</View>
							</View>
						)}
					</View>
				</View>

				{/* Metadata Card */}
				<View style={styles.metadataCard}>
					<View style={styles.metadataItem}>
						<Text style={styles.metadataLabel}>最后更新时间</Text>
						<Text style={styles.metadataValue}>{formatLastUpdated(account.lastUpdated)}</Text>
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
						onPress={() => navigation.navigate('EditAccount', { id: account.id, mode: 'edit' })}
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
						<Ionicons name="alert-circle" size={16} color="#ef4444" />
						<Text style={styles.dangerTitle}>危险区域</Text>
					</View>
					<TouchableOpacity style={styles.dangerButton} onPress={deleteAccountPress}>
						<Ionicons name="trash-outline" size={20} color="#ef4444" />
						<Text style={styles.dangerButtonText}>永久删除账号</Text>
					</TouchableOpacity>
				</View>

				{/* Security Tip */}
				<View style={styles.securityTip}>
					<Text style={styles.securityTipTitle}>安全建议</Text>
					<Text style={styles.securityTipText}>
						建议定期更换您的 {account.appName} 密码并确保 SSH 密钥仅在受信任的设备上使用。
					</Text>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
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
		backgroundColor: '#f9fafb',
	},
	heroSection: {
		padding: 16,
		alignItems: 'center',
		gap: 24,
	},
	logoWrapper: {
		position: 'relative',
	},
	logoContainer: {
		width: 128,
		height: 128,
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: '#f9fafb',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	logo: {
		width: '100%',
		height: '100%',
	},
	logoText: {
		fontSize: 48,
		fontWeight: 'bold',
		color: '#3b82f6',
	},
	logoEditButton: {
		position: 'absolute',
		right: -7,
		bottom: -7,
		width: 42,
		height: 42,
		borderRadius: 21,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.primary,
		borderWidth: 3,
		borderColor: colors.surface,
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
		gap: 14,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
		paddingHorizontal: 4,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: colors.text,
	},
	sectionSubtitle: {
		fontSize: 12,
		color: colors.muted,
		marginTop: 4,
	},
	secureBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 14,
		backgroundColor: colors.primarySoft,
	},
	secureBadgeText: {
		fontSize: 11,
		fontWeight: '600',
		color: colors.primary,
	},
	credentialsList: {
		gap: 12,
	},
	credentialItem: {
		...cardStyles.surface,
		gap: 10,
		padding: 16,
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
		backgroundColor: '#f5f8ff',
		minHeight: 56,
		paddingLeft: 16,
		paddingRight: 6,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#e2eaff',
	},
	credentialValue: {
		fontSize: 16,
		fontWeight: '600',
		color: colors.text,
		flex: 1,
	},
	passwordValue: {
		letterSpacing: 0.5,
	},
	credentialActions: {
		flexDirection: 'row',
		gap: 4,
	},
	credentialValueLink: {
		fontSize: 16,
		fontWeight: '500',
		color: '#3b82f6',
		flex: 1,
	},
	actionButton: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 12,
		backgroundColor: '#ffffff',
	},
	metadataCard: {
		...cardStyles.base,
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
		backgroundColor: '#f9fafb',
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
		...cardStyles.base,
		padding: 24,
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
		...cardStyles.base,
		backgroundColor: 'rgba(59, 130, 246, 0.1)',
		padding: 24,
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
