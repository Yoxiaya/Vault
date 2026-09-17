import { ThemeColors, useAppTheme } from '../theme';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { useToast } from '../components/Toast';

export default function GeneratorPage() {
	const toast = useToast();
	const { colors } = useAppTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const [tipsExpanded, setTipsExpanded] = useState(false);
	const [password, setPassword] = useState('');
	const [length, setLength] = useState(16);
	const [options, setOptions] = useState({
		uppercase: true,
		lowercase: true,
		numbers: true,
		symbols: true,
	});
	// 字符集定义（排除易混淆字符）
	const charset = {
		uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
		lowercase: 'abcdefghijkmnpqrstuvwxyz',
		numbers: '23456789',
		symbols: '!@#$%^&*()_+[]{}<>?',
	};

	// 生成密码
	const generatePassword = useCallback(() => {
		let chars = '';
		if (options.uppercase) chars += charset.uppercase;
		if (options.lowercase) chars += charset.lowercase;
		if (options.numbers) chars += charset.numbers;
		if (options.symbols) chars += charset.symbols;

		if (!chars) {
			setPassword('请至少选择一个选项');
			return;
		}

		let result = '';
		// 确保至少包含每种选中的字符类型各一个
		const selectedTypes = [];
		if (options.uppercase) selectedTypes.push(charset.uppercase);
		if (options.lowercase) selectedTypes.push(charset.lowercase);
		if (options.numbers) selectedTypes.push(charset.numbers);
		if (options.symbols) selectedTypes.push(charset.symbols);

		// 先各取一个字符保证类型完整
		for (const type of selectedTypes) {
			result += type.charAt(Math.floor(Math.random() * type.length));
		}

		// 填充剩余长度
		for (let i = result.length; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}

		// 打乱字符顺序
		result = result
			.split('')
			.sort(() => Math.random() - 0.5)
			.join('');
		setPassword(result);
	}, [options, length]);

	// 当选项或长度变化时重新生成
	useEffect(() => {
		generatePassword();
	}, [options, length, generatePassword]);

	// 复制密码
	const copyToClipboard = async () => {
		if (!password || password === '请至少选择一个选项') {
			toast.warning('无法复制', '请先生成密码');
			return;
		}
		await Clipboard.setString(password);
		toast.success('复制成功', '密码已复制到剪贴板');
	};

	// 切换选项（确保至少保留一个选项）
	const toggleOption = (key: keyof typeof options) => {
		const newOptions = { ...options, [key]: !options[key] };
		const anySelected = Object.values(newOptions).some((v) => v === true);
		if (!anySelected) {
			toast.warning('提示', '请至少保留一个字符类型');
			return;
		}
		setOptions(newOptions);
	};

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={{ paddingBottom: 112 }}
			showsVerticalScrollIndicator={false}
		>
			{/* 显示密码区域 */}
			<View style={styles.passwordSection}>
				<View style={styles.passwordCard}>
					<Text style={styles.passwordLabel}>密码生成器</Text>
					<Text style={styles.passwordText} selectable>
						{password || '点击刷新生成密码'}
					</Text>

					<PasswordStrengthIndicator password={password} mode="progress" showFeedback={false} />

					<View style={styles.passwordActions}>
						<TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
							<Ionicons name="copy-outline" size={20} color="white" />
							<Text style={styles.copyButtonText}>复制密码</Text>
						</TouchableOpacity>
						<TouchableOpacity
							accessibilityRole="button"
							accessibilityLabel="重新生成密码"
							style={styles.refreshButton}
							onPress={generatePassword}
						>
							<Ionicons name="refresh" size={24} color={colors.muted} />
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* 控制区域 */}
			<View style={styles.controlsSection}>
				{/* 长度选择 */}
				<View style={styles.controlCard}>
					<View style={styles.lengthHeader}>
						<Text style={styles.controlTitle}>密码长度</Text>
						<Text style={styles.lengthValue}>{length}</Text>
					</View>
					<View style={styles.lengthPresets}>
						{[8, 12, 16, 20, 24, 32, 48, 64].map((n) => (
							<TouchableOpacity
								key={n}
								accessibilityRole="button"
								accessibilityState={{ selected: length === n }}
								accessibilityLabel={`${n} 位密码`}
								style={[styles.presetBtn, length === n && styles.presetBtnActive]}
								onPress={() => setLength(n)}
							>
								<Text style={[styles.presetBtnText, length === n && styles.presetBtnTextActive]}>
									{n}
								</Text>
							</TouchableOpacity>
						))}
					</View>
					<View style={styles.lengthTips}>
						<Text style={styles.lengthTipText}>建议使用至少 16 位密码</Text>
					</View>
				</View>

				{/* 字符类型开关 */}
				<View style={styles.controlCard}>
					<Text style={styles.sectionSubtitle}>字符类型</Text>
					{Object.entries(options).map(([key, value]) => (
						<View key={key} style={styles.switchItem}>
							<View style={styles.switchLabel}>
								<View style={[styles.switchIcon, value && styles.switchIconActive]}>
									<Text style={[styles.switchIconText, value && styles.switchIconTextActive]}>
										{key === 'uppercase'
											? 'A+'
											: key === 'lowercase'
												? 'a+'
												: key === 'numbers'
													? '12'
													: '#!'}
									</Text>
								</View>
								<Text style={styles.switchText}>
									{key === 'uppercase'
										? '大写字母 (A-Z)'
										: key === 'lowercase'
											? '小写字母 (a-z)'
											: key === 'numbers'
												? '数字 (2-9)'
												: '特殊符号 (!@#$)'}
								</Text>
							</View>
							<Switch
								value={value}
								onValueChange={() => toggleOption(key as keyof typeof options)}
								trackColor={{ false: colors.border, true: colors.primary }}
								thumbColor="white"
							/>
						</View>
					))}
					<View style={styles.charNote}>
						<Ionicons name="information-circle-outline" size={14} color={colors.muted} />
						<Text style={styles.charNoteText}>已自动排除 0/O、1/I/l 等易混淆字符</Text>
					</View>
				</View>
			</View>

			{/* 安全建议区域 */}
			<View style={styles.tipsSection}>
				<TouchableOpacity
					accessibilityRole="button"
					accessibilityState={{ expanded: tipsExpanded }}
					onPress={() => setTipsExpanded(!tipsExpanded)}
					style={styles.tipsHeader}
				>
					<Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
					<Text style={styles.tipsTitle}>密码使用建议</Text>
					<Ionicons name={tipsExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
				</TouchableOpacity>
				{tipsExpanded && (
					<View style={styles.tipsGrid}>
						<View style={styles.tipItem}>
							<View style={styles.tipIcon}>
								<Ionicons name="trending-up-outline" size={20} color={colors.primary} />
								<Text style={styles.tipTitle}>长度优先</Text>
							</View>
							<Text style={styles.tipDescription}>
								相比于字符复杂性，增加长度对防止暴力破解更为有效。当前推荐{' '}
								{length >= 16 ? '✓ 长度充足' : '⚠ 建议使用16位以上'}。
							</Text>
						</View>
						<View style={styles.tipItem}>
							<View style={styles.tipIcon}>
								<Ionicons name="eye-off-outline" size={20} color={colors.primary} />
								<Text style={styles.tipTitle}>避免规律</Text>
							</View>
							<Text style={styles.tipDescription}>
								生成器已自动排除易混淆字符，确保手动输入时不会出错，同时避免使用生日、姓名等个人信息。
							</Text>
						</View>
						<View style={styles.tipItem}>
							<View style={styles.tipIcon}>
								<Ionicons name="refresh-circle-outline" size={20} color={colors.primary} />
								<Text style={styles.tipTitle}>切勿重用</Text>
							</View>
							<Text style={styles.tipDescription}>
								每个账号应使用唯一的随机密码。若一个账号泄露，其他账号依然安全。建议使用密码管理器统一管理。
							</Text>
						</View>
					</View>
				)}
			</View>
		</ScrollView>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.page,
		},
		passwordSection: {
			padding: 20,
			paddingBottom: 0,
		},
		passwordCard: {
			backgroundColor: colors.primarySoft,
			borderColor: colors.border,
			borderWidth: 1,
			borderRadius: 16,
			padding: 20,
			gap: 16,
		},
		passwordLabel: {
			fontSize: 16,
			fontWeight: '600',
			color: colors.brand,
		},
		passwordText: {
			fontSize: 22,
			fontWeight: '600',
			color: colors.text,
			fontFamily: 'monospace',
			lineHeight: 32,
			letterSpacing: 0.5,
		},
		passwordActions: {
			flexDirection: 'row',
			gap: 12,
			paddingTop: 8,
		},
		copyButton: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			backgroundColor: colors.primary,
			borderRadius: 26,
			minHeight: 52,
			padding: 14,
		},
		copyButtonText: {
			fontSize: 15,
			fontWeight: '600',
			color: 'white',
		},
		refreshButton: {
			width: 52,
			height: 52,
			borderRadius: 12,
			backgroundColor: colors.card,
			justifyContent: 'center',
			alignItems: 'center',
			borderWidth: 1,
			borderColor: colors.border,
		},
		controlsSection: {
			padding: 20,
			gap: 16,
		},
		controlCard: {
			backgroundColor: colors.card,
			borderColor: colors.border,
			borderWidth: 1,
			borderRadius: 16,
			padding: 16,
		},
		controlTitle: {
			fontSize: 18,
			fontWeight: '600',
			color: colors.text,
		},
		sectionSubtitle: {
			fontSize: 14,
			fontWeight: '500',
			color: colors.muted,
			marginBottom: 16,
		},
		lengthHeader: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 16,
		},
		lengthValue: {
			fontSize: 28,
			fontWeight: '700',
			color: colors.primary,
		},
		lengthPresets: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: 8,
			marginBottom: 12,
		},
		presetBtn: {
			width: '22%',
			flexGrow: 1,
			minHeight: 44,
			paddingVertical: 10,
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: 12,
			backgroundColor: colors.surface,
			borderWidth: 1,
			borderColor: colors.border,
		},
		presetBtnActive: {
			backgroundColor: colors.primary,
			borderColor: colors.primary,
		},
		presetBtnText: {
			fontSize: 15,
			fontWeight: '500',
			color: colors.muted,
		},
		presetBtnTextActive: {
			color: 'white',
			fontWeight: '700',
		},
		lengthTips: {
			marginTop: 8,
			paddingTop: 12,
			borderTopWidth: 1,
			borderTopColor: colors.border,
		},
		lengthTipText: {
			fontSize: 13,
			color: colors.muted,
		},
		switchItem: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
		},
		switchLabel: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			flex: 1,
			paddingRight: 8,
		},
		switchIcon: {
			padding: 8,
			backgroundColor: colors.surface,
			borderRadius: 10,
			borderWidth: 1,
			borderColor: colors.border,
		},
		switchIconActive: {
			backgroundColor: colors.primarySoft,
			borderColor: colors.primarySoft,
		},
		switchIconText: {
			fontSize: 12,
			fontWeight: 'bold',
			color: colors.muted,
			textTransform: 'uppercase',
		},
		switchIconTextActive: {
			color: colors.primary,
		},
		switchText: {
			fontSize: 14,
			color: colors.text,
			flexShrink: 1,
		},
		charNote: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			marginTop: 12,
			paddingTop: 12,
			borderTopWidth: 1,
			borderTopColor: colors.border,
		},
		charNoteText: {
			fontSize: 12,
			lineHeight: 18,
			color: colors.muted,
			flex: 1,
		},
		tipsSection: {
			backgroundColor: colors.surface,
			borderColor: colors.border,
			borderWidth: 1,
			borderRadius: 16,
			marginHorizontal: 20,
			padding: 16,
			gap: 20,
		},
		tipsHeader: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			minHeight: 44,
		},
		tipsTitle: {
			fontSize: 14,
			fontWeight: '600',
			color: colors.text,
			flex: 1,
		},
		tipsGrid: {
			gap: 20,
		},
		tipItem: {
			gap: 8,
		},
		tipIcon: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
		},
		tipTitle: {
			fontSize: 15,
			fontWeight: '600',
			color: colors.text,
		},
		tipDescription: {
			fontSize: 14,
			color: colors.muted,
			lineHeight: 20,
			paddingLeft: 28,
		},
	});
