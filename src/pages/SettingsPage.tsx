import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Animated, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../App';
import { useAuth } from '../context/AuthContext';
import { useUserInfoStore } from '../store';
import { ThemeColors, useAppTheme } from '../theme';

type SettingsPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SettingsPage'>;

export default function SettingsPage() {
	const navigation = useNavigation<SettingsPageNavigationProp>();
	const { userInfo, loading: userInfoLoading, fetchUserInfo } = useUserInfoStore();
	const { signOut } = useAuth();
	const { colors } = useAppTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const [biometricEnabled, setBiometricEnabled] = useState(true);
	const skeletonOpacity = useRef(new Animated.Value(0.35)).current;

	useEffect(() => {
		void fetchUserInfo();
	}, [fetchUserInfo]);

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(skeletonOpacity, { toValue: 0.72, duration: 750, useNativeDriver: true }),
				Animated.timing(skeletonOpacity, { toValue: 0.35, duration: 750, useNativeDriver: true }),
			])
		);
		animation.start();
		return () => animation.stop();
	}, [skeletonOpacity]);

	const showProfileSkeleton = userInfoLoading || !userInfo.profileName;

	const sections = [
		{
			title: '账户设置',
			items: [
				{ label: '修改主密码', icon: 'lock-closed-outline', type: 'link', to: 'LoginPage' },
				{ label: '自动填充设置', icon: 'document-text-outline', type: 'link', to: 'RegisterPage' },
				{ label: '生物识别登录', icon: 'finger-print', type: 'switch', value: biometricEnabled },
			],
		},
		{
			title: '应用偏好',
			items: [
				{ label: '主题设置', icon: 'color-palette-outline', type: 'link', to: 'ThemeSettingsPage' },
				{ label: '账号分类', icon: 'folder-open-outline', type: 'link', to: 'CategoryManagementPage' },
				{ label: '语言选择', icon: 'globe-outline', type: 'select', value: '简体中文' },
				{ label: '清除剪贴板时长', icon: 'time-outline', type: 'select', value: '30秒' },
			],
		},
		{
			title: '关于与支持',
			items: [
				{ label: '帮助与支持', icon: 'help-circle-outline', type: 'external' },
				{ label: '隐私政策', icon: 'shield-checkmark-outline', type: 'link' },
				{ label: '关于猫娘密码库', icon: 'information-circle-outline', type: 'text', value: 'Version 2.4.0' },
			],
		},
	];

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
			showsVerticalScrollIndicator={false}
		>
			{showProfileSkeleton ? (
				<View style={styles.profileSection} accessibilityLabel="正在加载个人信息">
					<Animated.View style={[styles.profileSkeletonAvatar, { opacity: skeletonOpacity }]} />
					<View style={styles.profileSkeletonInfo}>
						<Animated.View style={[styles.profileSkeletonName, { opacity: skeletonOpacity }]} />
						<Animated.View style={[styles.profileSkeletonBadge, { opacity: skeletonOpacity }]} />
					</View>
				</View>
			) : (
				<TouchableOpacity style={styles.profileSection} onPress={() => navigation.navigate('ProfilePage')}>
					<View style={styles.profileImageContainer}>
						<Image
							source={{
								uri: userInfo.profileAvatar ?? 'https://pic1.imgdb.cn/item/69fc39d94b8701858e714b98.jpg',
							}}
							style={styles.profileImage}
						/>
						<View style={styles.verifiedBadge}>
							<Ionicons name="checkmark" size={14} color="#FFFFFF" />
						</View>
					</View>
					<View style={styles.profileInfo}>
						<Text style={styles.profileName}>{userInfo.profileName}</Text>
						<View style={styles.securityBadge}>
							<Ionicons name="shield-checkmark" size={14} color={colors.primary} />
							<Text style={styles.securityBadgeText}>安全等级：极高</Text>
						</View>
					</View>
				</TouchableOpacity>
			)}

			<View style={styles.settingsSections}>
				{sections.map((section) => (
					<View key={section.title} style={styles.section}>
						<Text style={styles.sectionTitle}>{section.title}</Text>
						<View style={styles.sectionContent}>
							{section.items.map((item, index) => (
								<TouchableOpacity
									key={item.label}
									style={[
										styles.settingItem,
										index !== section.items.length - 1 && styles.settingItemBorder,
									]}
									onPress={() => {
										if (item.type === 'link' && 'to' in item && item.to)
											navigation.navigate(item.to as never);
									}}
								>
									<View style={styles.settingItemLeft}>
										<View style={styles.settingIcon}>
											<Ionicons
												name={item.icon as keyof typeof Ionicons.glyphMap}
												size={20}
												color={colors.primary}
											/>
										</View>
										<Text style={styles.settingLabel}>{item.label}</Text>
									</View>
									{item.type === 'link' ? (
										<Ionicons name="chevron-forward" size={20} color={colors.muted} />
									) : null}
									{item.type === 'switch' ? (
										<Switch
											value={biometricEnabled}
											onValueChange={setBiometricEnabled}
											trackColor={{ false: colors.border, true: colors.primary }}
											thumbColor="#FFFFFF"
										/>
									) : null}
									{item.type === 'select' ? (
										<View style={styles.selectContainer}>
											<Text style={styles.selectValue}>{item.value}</Text>
											<Ionicons name="chevron-down" size={20} color={colors.muted} />
										</View>
									) : null}
									{item.type === 'external' ? (
										<Ionicons name="open-outline" size={20} color={colors.muted} />
									) : null}
									{item.type === 'text' ? <Text style={styles.textValue}>{item.value}</Text> : null}
								</TouchableOpacity>
							))}
						</View>
					</View>
				))}
			</View>

			<View style={styles.logoutSection}>
				<TouchableOpacity style={styles.logoutButton} onPress={() => void signOut()}>
					<Text style={styles.logoutButtonText}>退出登录</Text>
				</TouchableOpacity>
				<Text style={styles.encryptionText}>Secured by End-to-End Encryption</Text>
			</View>
		</ScrollView>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { flex: 1, backgroundColor: colors.page },
		content: { padding: 16, paddingBottom: 112, gap: 24 },
		profileSection: {
			padding: 20,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 20,
			borderRadius: 18,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.card,
		},
		profileImageContainer: { position: 'relative' },
		profileImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.border },
		profileSkeletonAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.border },
		profileSkeletonInfo: { flex: 1, gap: 12, justifyContent: 'center' },
		profileSkeletonName: { width: '58%', height: 21, borderRadius: 7, backgroundColor: colors.border },
		profileSkeletonBadge: { width: 128, height: 25, borderRadius: 13, backgroundColor: colors.border },
		verifiedBadge: {
			position: 'absolute',
			bottom: -4,
			right: -4,
			width: 24,
			height: 24,
			borderRadius: 12,
			backgroundColor: colors.primary,
			justifyContent: 'center',
			alignItems: 'center',
			borderWidth: 2,
			borderColor: colors.card,
		},
		profileInfo: { flex: 1, gap: 8 },
		profileName: { fontSize: 20, fontWeight: '700', color: colors.text },
		securityBadge: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			paddingHorizontal: 12,
			paddingVertical: 4,
			backgroundColor: colors.primarySoft,
			borderRadius: 20,
			alignSelf: 'flex-start',
		},
		securityBadgeText: { fontSize: 12, fontWeight: '600', color: colors.primary },
		settingsSections: { gap: 24 },
		section: { gap: 8 },
		sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 1, paddingHorizontal: 8 },
		sectionContent: {
			overflow: 'hidden',
			borderRadius: 18,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.card,
		},
		settingItem: {
			minHeight: 72,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 18,
		},
		settingItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
		settingItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
		settingIcon: {
			width: 40,
			height: 40,
			borderRadius: 12,
			backgroundColor: colors.primarySoft,
			justifyContent: 'center',
			alignItems: 'center',
		},
		settingLabel: { fontSize: 15, fontWeight: '500', color: colors.text },
		selectContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		selectValue: { fontSize: 13, color: colors.muted },
		textValue: { fontSize: 13, color: colors.muted },
		logoutSection: { alignItems: 'center', gap: 20 },
		logoutButton: {
			minHeight: 48,
			minWidth: 168,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#EF4444',
			borderRadius: 16,
		},
		logoutButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
		encryptionText: { fontSize: 10, color: colors.muted, letterSpacing: 1 },
	});
