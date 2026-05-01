import React, { useState } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Modal,
	ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { useForm, Controller } from 'react-hook-form';
import { register } from '../service/api';

type RegisterPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegisterPage'>;

interface RegisterFormData {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

const RegisterScreen = () => {
	const navigation = useNavigation<RegisterPageNavigationProp>();
	const insets = useSafeAreaInsets();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<RegisterFormData>({
		defaultValues: {
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const passwordValue = watch('password');

	// 简单的密码强度计算
	const getPasswordStrength = (password: string): { level: number; text: string; bars: number[] } => {
		let strength = 0;
		if (password.length >= 6) strength++;
		if (password.length >= 10) strength++;
		if (/[A-Z]/.test(password)) strength++;
		if (/[0-9]/.test(password)) strength++;
		if (/[^A-Za-z0-9]/.test(password)) strength++;

		const level = Math.min(strength, 4);
		const levels = ['极弱', '弱', '中', '强', '极强'];
		const bars = [0, 1, 2, 3, 4].map((i) => (i < level ? 1 : 0));

		return { level, text: levels[level], bars };
	};

	const passwordStrength = getPasswordStrength(passwordValue || '');

	const onSubmit = async (data: RegisterFormData) => {
		setIsLoading(true);
		try {
			console.log('Register attempt with:', data.username, data.email, data.password);
			await register(data);
			alert('注册成功！');
		} catch (error) {
			alert('注册失败，请重试');
		} finally {
			navigation.navigate('LoginPage');
			setIsLoading(false);
		}
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.mainContent}>
						<View style={styles.innerWrapper}>
							{/* 应用图标区域 */}
							<View style={styles.iconContainer}>
								<View style={styles.logoContainer}>
									<Ionicons name="lock-closed" size={48} color="#3b82f6" />
								</View>
							</View>

							{/* 标题与副标题 */}
							<View style={styles.headerTextContainer}>
								<Text style={styles.title}>The Vault</Text>
								<Text style={styles.subtitle}>开始您的宁静数字之旅</Text>
							</View>

							{/* 注册表单卡片 */}
							<View style={styles.formContainer}>
								{/* 用户名输入框 */}
								<View style={styles.formGroup}>
									<Text style={styles.formLabel}>用户名</Text>
									<View style={styles.inputWithIcon}>
										<Controller
											control={control}
											rules={{
												required: '用户名不能为空',
												minLength: {
													value: 3,
													message: '用户名至少3个字符',
												},
												maxLength: {
													value: 20,
													message: '用户名最多20个字符',
												},
												pattern: {
													value: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
													message: '用户名只能包含字母、数字、下划线或中文',
												},
											}}
											render={({ field: { onChange, onBlur, value } }) => (
												<TextInput
													style={styles.formInput}
													placeholder="请输入用户名"
													value={value}
													onChangeText={onChange}
													onBlur={onBlur}
													autoCapitalize="none"
													autoCorrect={false}
												/>
											)}
											name="username"
										/>
										<Ionicons
											name="person-outline"
											size={20}
											color="#6b7280"
											style={styles.inputIcon}
										/>
									</View>
									{errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}
								</View>

								{/* 邮箱输入框 */}
								<View style={styles.formGroup}>
									<Text style={styles.formLabel}>电子邮箱</Text>
									<View style={styles.inputWithIcon}>
										<Controller
											control={control}
											rules={{
												required: '邮箱不能为空',
												pattern: {
													value: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
													message: '请输入有效的邮箱地址',
												},
											}}
											render={({ field: { onChange, onBlur, value } }) => (
												<TextInput
													style={styles.formInput}
													placeholder="your@email.com"
													value={value}
													onChangeText={onChange}
													onBlur={onBlur}
													autoCapitalize="none"
													autoCorrect={false}
													keyboardType="email-address"
												/>
											)}
											name="email"
										/>
										<Ionicons
											name="mail-outline"
											size={20}
											color="#6b7280"
											style={styles.inputIcon}
										/>
									</View>
									{errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
								</View>

								{/* 主密码输入框 */}
								<View style={styles.formGroup}>
									<Text style={styles.formLabel}>主密码</Text>
									<View style={styles.inputWithIcon}>
										<Controller
											control={control}
											rules={{
												required: '密码不能为空',
												minLength: {
													value: 6,
													message: '密码长度至少为6位',
												},
											}}
											render={({ field: { onChange, onBlur, value } }) => (
												<TextInput
													style={styles.formInput}
													placeholder="设置您的主密码"
													value={value}
													onChangeText={onChange}
													onBlur={onBlur}
													secureTextEntry={!showPassword}
													autoCapitalize="none"
													autoCorrect={false}
												/>
											)}
											name="password"
										/>
										<View style={styles.passwordActions}>
											<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
												<Ionicons
													name={showPassword ? 'eye-off-outline' : 'eye-outline'}
													size={20}
													color="#6b7280"
												/>
											</TouchableOpacity>
										</View>
									</View>
									{errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

									{/* 密码强度指示器 */}
									{passwordValue && passwordValue.length > 0 && (
										<View style={styles.strengthContainer}>
											<View style={styles.strengthMeter}>
												{passwordStrength.bars.map((filled, index) => (
													<View
														key={index}
														style={[
															styles.strengthBar,
															filled ? styles.strengthBarFull : styles.strengthBarEmpty,
														]}
													/>
												))}
											</View>
											<Text style={styles.strengthText}>强度: {passwordStrength.text}</Text>
										</View>
									)}
								</View>

								{/* 确认密码输入框 */}
								<View style={styles.formGroup}>
									<Text style={styles.formLabel}>确认主密码</Text>
									<View style={styles.inputWithIcon}>
										<Controller
											control={control}
											rules={{
												required: '请确认密码',
												validate: (value) => value === passwordValue || '两次输入的密码不一致',
											}}
											render={({ field: { onChange, onBlur, value } }) => (
												<TextInput
													style={styles.formInput}
													placeholder="再次输入主密码"
													value={value}
													onChangeText={onChange}
													onBlur={onBlur}
													secureTextEntry={!showConfirmPassword}
													autoCapitalize="none"
													autoCorrect={false}
												/>
											)}
											name="confirmPassword"
										/>
										<View style={styles.passwordActions}>
											<TouchableOpacity
												onPress={() => setShowConfirmPassword(!showConfirmPassword)}
											>
												<Ionicons
													name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
													size={20}
													color="#6b7280"
												/>
											</TouchableOpacity>
										</View>
									</View>
									{errors.confirmPassword && (
										<Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
									)}
								</View>

								{/* 安全提示 */}
								<View style={styles.securityWarning}>
									<Ionicons
										name="information-circle"
										size={20}
										color="#3b82f6"
										style={styles.warningIcon}
									/>
									<Text style={styles.warningText}>
										您的主密码是解开加密金库的唯一钥匙。我们无法查看、重置或找回它。请务必妥善保管。
									</Text>
								</View>

								{/* 注册按钮 */}
								<TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.primaryButton}>
									<Ionicons name="checkmark-circle" size={20} color="white" />
									<Text style={styles.primaryButtonText}>创建并开始使用</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>

			{/* Loading Mask */}
			<Modal transparent={true} visible={isLoading} animationType="fade" onRequestClose={() => {}}>
				<View style={styles.loadingOverlay}>
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color="#3b82f6" />
						<Text style={styles.loadingText}>正在创建账号...</Text>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f9fafb',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		height: 56,
		backgroundColor: '#f9fafb',
		borderBottomWidth: 1,
		borderBottomColor: '#e5e7eb',
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f3f4f6',
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#1f2937',
	},
	headerSpacer: {
		width: 40,
	},
	keyboardView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	mainContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingBottom: 32,
	},
	innerWrapper: {
		width: '100%',
		maxWidth: 400,
		alignItems: 'center',
	},
	// 图标区域
	iconContainer: {
		marginBottom: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	logoContainer: {
		width: 128,
		height: 128,
		borderRadius: 64,
		backgroundColor: '#f3f4f6',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 4,
		borderColor: '#f9fafb',
	},
	// 标题区域
	headerTextContainer: {
		marginBottom: 24,
		alignItems: 'center',
		width: '100%',
	},
	title: {
		fontSize: 24,
		fontWeight: '600',
		color: '#1f2937',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 14,
		color: '#6b7280',
		textAlign: 'center',
	},
	// 表单容器
	formContainer: {
		backgroundColor: '#f9fafb',
		borderRadius: 12,
		padding: 24,
		margin: 16,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		width: '100%',
	},
	// 表单组
	formGroup: {
		marginBottom: 24,
	},
	formLabel: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#6b7280',
		textTransform: 'uppercase',
		letterSpacing: 1,
		marginBottom: 8,
	},
	inputWithIcon: {
		position: 'relative',
	},
	formInput: {
		backgroundColor: '#f3f4f6',
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: '#1f2937',
	},
	inputIcon: {
		position: 'absolute',
		right: 16,
		top: 12,
	},
	passwordActions: {
		position: 'absolute',
		right: 16,
		top: 10,
		flexDirection: 'row',
		gap: 12,
	},
	// 密码强度
	strengthContainer: {
		marginTop: 12,
	},
	strengthMeter: {
		flexDirection: 'row',
		gap: 4,
		height: 4,
		marginBottom: 4,
	},
	strengthBar: {
		flex: 1,
		borderRadius: 2,
	},
	strengthBarFull: {
		backgroundColor: '#3b82f6',
	},
	strengthBarEmpty: {
		backgroundColor: '#e5e7eb',
	},
	strengthText: {
		fontSize: 12,
		color: '#6b7280',
		textAlign: 'right',
	},
	// 安全提示
	securityWarning: {
		flexDirection: 'row',
		backgroundColor: 'rgba(216, 227, 248, 0.5)',
		borderRadius: 12,
		padding: 16,
		marginTop: 16,
		marginBottom: 24,
		gap: 12,
	},
	warningIcon: {
		marginTop: 2,
	},
	warningText: {
		flex: 1,
		fontSize: 14,
		color: '#3b82f6',
		lineHeight: 20,
	},
	// 主按钮
	primaryButton: {
		flex: 1,
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
		fontWeight: '600',
		color: 'white',
	},
	errorText: {
		color: '#ef4444',
		fontSize: 12,
		marginTop: 4,
		marginLeft: 12,
	},
	loadingOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingContainer: {
		backgroundColor: 'white',
		padding: 20,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: 120,
	},
	loadingText: {
		marginTop: 12,
		fontSize: 16,
		color: '#1f2937',
		fontWeight: '500',
	},
});

export default RegisterScreen;
