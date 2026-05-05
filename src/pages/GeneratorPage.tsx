import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

export default function GeneratorPage() {
	const [password, setPassword] = useState('');
	const [length, setLength] = useState(16);
	const [options, setOptions] = useState({
		uppercase: true,
		lowercase: true,
		numbers: true,
		symbols: true,
	});
	const [strength, setStrength] = useState({ level: '中等', color: '#f59e0b', description: '' });

	// 字符集定义（排除易混淆字符）
	const charset = {
		uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
		lowercase: 'abcdefghijkmnpqrstuvwxyz',
		numbers: '23456789',
		symbols: '!@#$%^&*()_+[]{}<>?',
	};

	// 计算密码强度
	const calculateStrength = useCallback((pwd: string, pwdOptions: typeof options, pwdLength: number) => {
		if (!pwd) return { level: '无效', color: '#9ca3af', description: '请选择至少一个字符类型' };

		let score = 0;
		let hasUpper = /[A-Z]/.test(pwd);
		let hasLower = /[a-z]/.test(pwd);
		let hasNumber = /[0-9]/.test(pwd);
		let hasSymbol = /[^A-Za-z0-9]/.test(pwd);

		// 长度评分
		if (pwdLength >= 20) score += 40;
		else if (pwdLength >= 16) score += 30;
		else if (pwdLength >= 12) score += 20;
		else if (pwdLength >= 8) score += 10;

		// 字符类型评分
		const typesUsed = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
		score += typesUsed * 15;

		// 额外奖励：混合使用多种类型
		if (typesUsed >= 3) score += 10;
		if (typesUsed === 4) score += 5;

		if (score >= 80) {
			return { level: '非常强', color: '#10b981', description: '极其安全的密码，适合银行、邮箱等核心账户' };
		} else if (score >= 60) {
			return { level: '强', color: '#3b82f6', description: '安全性较高，可满足大多数场景需求' };
		} else if (score >= 40) {
			return { level: '中等', color: '#f59e0b', description: '建议增加长度或启用更多字符类型' };
		} else {
			return { level: '弱', color: '#ef4444', description: '不够安全，建议使用更长密码或启用更多选项' };
		}
	}, []);

	// 生成密码
	const generatePassword = useCallback(() => {
		let chars = '';
		if (options.uppercase) chars += charset.uppercase;
		if (options.lowercase) chars += charset.lowercase;
		if (options.numbers) chars += charset.numbers;
		if (options.symbols) chars += charset.symbols;

		if (!chars) {
			setPassword('请至少选择一个选项');
			setStrength({ level: '无效', color: '#9ca3af', description: '请选择至少一个字符类型' });
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
		setStrength(calculateStrength(result, options, length));
	}, [options, length, calculateStrength]);

	// 当选项或长度变化时重新生成
	useEffect(() => {
		generatePassword();
	}, [options, length, generatePassword]);

	// 复制密码
	const copyToClipboard = async () => {
		if (!password || password === '请至少选择一个选项') {
			Alert.alert('提示', '没有可复制的密码');
			return;
		}
		await Clipboard.setString(password);
		Alert.alert('成功', '密码已复制到剪贴板');
	};

	// 切换选项（确保至少保留一个选项）
	const toggleOption = (key: keyof typeof options) => {
		const newOptions = { ...options, [key]: !options[key] };
		const anySelected = Object.values(newOptions).some((v) => v === true);
		if (!anySelected) {
			Alert.alert('提示', '请至少保留一个字符类型');
			return;
		}
		setOptions(newOptions);
	};

	// 获取强度条宽度百分比
	const getStrengthWidth = () => {
		switch (strength.level) {
			case '非常强':
				return '100%';
			case '强':
				return '75%';
			case '中等':
				return '50%';
			case '弱':
				return '25%';
			default:
				return '0%';
		}
	};

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			{/* 显示密码区域 */}
			<View style={styles.passwordSection}>
				<View style={styles.passwordCard}>
					<Text style={styles.passwordLabel}>生成的安全密码</Text>
					<Text style={styles.passwordText} numberOfLines={2} adjustsFontSizeToFit>
						{password || '点击刷新生成密码'}
					</Text>

					<PasswordStrengthIndicator password={password} mode="progress" />

					<View style={styles.passwordActions}>
						<TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
							<Ionicons name="copy-outline" size={20} color="white" />
							<Text style={styles.copyButtonText}>复制密码</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.refreshButton} onPress={generatePassword}>
							<Ionicons name="refresh" size={24} color="#4b5563" />
						</TouchableOpacity>
					</View>
				</View>

				<View
					style={[
						styles.strengthCard,
						{ backgroundColor: strength.color + '10', borderColor: strength.color + '30' },
					]}
				>
					<Ionicons name="information-circle-outline" size={32} color={strength.color} />
					<Text style={[styles.strengthTitle, { color: strength.color }]}>密码强度：{strength.level}</Text>
					<Text style={[styles.strengthDescription, { color: strength.color }]}>
						{strength.description || '建议每3-6个月更换一次核心资产密码以确保最高级别的安全性。'}
					</Text>
				</View>
				{/* 快捷生成按钮 */}
				<View style={styles.quickActions}>
					<TouchableOpacity
						style={[styles.quickButton, styles.quickButtonPrimary]}
						onPress={generatePassword}
					>
						<Ionicons name="flash" size={20} color="white" />
						<Text style={styles.quickButtonText}>立即生成</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.quickButton} onPress={() => setLength(20)}>
						<Text style={styles.quickButtonTextSecondary}>推荐20位</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* 控制区域 */}
			<View style={styles.controlsSection}>
				{/* 长度滑块 */}
				<View style={styles.controlCard}>
					<View style={styles.lengthHeader}>
						<Text style={styles.controlTitle}>密码长度</Text>
						<Text style={styles.lengthValue}>{length}</Text>
					</View>
					<Slider
						style={styles.slider}
						minimumValue={4}
						maximumValue={64}
						step={1}
						value={length}
						onValueChange={setLength}
						minimumTrackTintColor="#3b82f6"
						maximumTrackTintColor="#e5e7eb"
						thumbTintColor="#3b82f6"
					/>
					<View style={styles.sliderLabels}>
						<Text style={styles.sliderLabel}>4 位</Text>
						<Text style={styles.sliderLabel}>64 位</Text>
					</View>
					<View style={styles.lengthTips}>
						<Text style={styles.lengthTipText}>💡 推荐使用 16 位以上密码</Text>
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
								trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
								thumbColor="white"
							/>
						</View>
					))}
					<View style={styles.charNote}>
						<Ionicons name="information-circle-outline" size={14} color="#9ca3af" />
						<Text style={styles.charNoteText}>已自动排除 0/O、1/I/l 等易混淆字符</Text>
					</View>
				</View>
			</View>

			{/* 安全建议区域 */}
			<View style={styles.tipsSection}>
				<View style={styles.tipsHeader}>
					<Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
					<Text style={styles.tipsTitle}>专业安全建议</Text>
				</View>
				<View style={styles.tipsGrid}>
					<View style={styles.tipItem}>
						<View style={styles.tipIcon}>
							<Ionicons name="trending-up-outline" size={20} color="#3b82f6" />
							<Text style={styles.tipTitle}>长度优先</Text>
						</View>
						<Text style={styles.tipDescription}>
							相比于字符复杂性，增加长度对防止暴力破解更为有效。当前推荐{' '}
							{length >= 16 ? '✓ 长度充足' : '⚠ 建议使用16位以上'}。
						</Text>
					</View>
					<View style={styles.tipItem}>
						<View style={styles.tipIcon}>
							<Ionicons name="eye-off-outline" size={20} color="#3b82f6" />
							<Text style={styles.tipTitle}>避免规律</Text>
						</View>
						<Text style={styles.tipDescription}>
							生成器已自动排除易混淆字符，确保手动输入时不会出错，同时避免使用生日、姓名等个人信息。
						</Text>
					</View>
					<View style={styles.tipItem}>
						<View style={styles.tipIcon}>
							<Ionicons name="refresh-circle-outline" size={20} color="#3b82f6" />
							<Text style={styles.tipTitle}>切勿重用</Text>
						</View>
						<Text style={styles.tipDescription}>
							每个账号应使用唯一的随机密码。若一个账号泄露，其他账号依然安全。建议使用密码管理器统一管理。
						</Text>
					</View>
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
	passwordSection: {
		padding: 16,
		gap: 16,
	},
	passwordCard: {
		backgroundColor: '#f3f4f6',
		borderRadius: 20,
		padding: 24,
		gap: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 10,
		elevation: 2,
	},
	passwordLabel: {
		fontSize: 12,
		fontWeight: '600',
		color: '#3b82f6',
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	passwordText: {
		fontSize: 22,
		fontWeight: '600',
		color: '#1f2937',
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
		backgroundColor: '#3b82f6',
		borderRadius: 12,
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
		backgroundColor: '#f9fafb',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	strengthCard: {
		borderRadius: 16,
		padding: 20,
		gap: 8,
		borderWidth: 1,
	},
	strengthTitle: {
		fontSize: 16,
		fontWeight: '600',
	},
	strengthDescription: {
		fontSize: 14,
		opacity: 0.8,
		lineHeight: 20,
	},
	controlsSection: {
		padding: 16,
		gap: 16,
	},
	controlCard: {
		backgroundColor: '#f3f4f6',
		borderRadius: 20,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 10,
		elevation: 2,
	},
	controlTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#1f2937',
	},
	sectionSubtitle: {
		fontSize: 14,
		fontWeight: '500',
		color: '#6b7280',
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
		color: '#3b82f6',
	},
	slider: {
		width: '100%',
		height: 40,
	},
	sliderLabels: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: -8,
		marginBottom: 12,
	},
	sliderLabel: {
		fontSize: 12,
		color: '#9ca3af',
		fontWeight: '500',
	},
	lengthTips: {
		marginTop: 8,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: '#f3f4f6',
	},
	lengthTipText: {
		fontSize: 12,
		color: '#f59e0b',
	},
	switchItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#f3f4f6',
	},
	switchLabel: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	switchIcon: {
		padding: 8,
		backgroundColor: '#f3f4f6',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	switchIconActive: {
		backgroundColor: '#3b82f6',
		borderColor: '#3b82f6',
	},
	switchIconText: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#6b7280',
		textTransform: 'uppercase',
	},
	switchIconTextActive: {
		color: 'white',
	},
	switchText: {
		fontSize: 15,
		fontWeight: '500',
		color: '#1f2937',
	},
	charNote: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: '#f3f4f6',
	},
	charNoteText: {
		fontSize: 12,
		color: '#9ca3af',
	},
	quickActions: {
		flexDirection: 'row',
		gap: 12,
	},
	quickButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		padding: 14,
		backgroundColor: '#f3f4f6',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	quickButtonPrimary: {
		backgroundColor: '#3b82f6',
		borderColor: '#3b82f6',
	},
	quickButtonText: {
		fontSize: 14,
		fontWeight: '600',
		color: 'white',
	},
	quickButtonTextSecondary: {
		fontSize: 14,
		fontWeight: '500',
		color: '#4b5563',
	},
	tipsSection: {
		margin: 16,
		padding: 20,
		backgroundColor: '#ffffff',
		borderRadius: 20,
		gap: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 10,
		elevation: 2,
		marginBottom: 32,
	},
	tipsHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	tipsTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#1f2937',
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
		color: '#1f2937',
	},
	tipDescription: {
		fontSize: 14,
		color: '#6b7280',
		lineHeight: 20,
		paddingLeft: 28,
	},
});
