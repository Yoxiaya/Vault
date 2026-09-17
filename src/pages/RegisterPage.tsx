import React, { useState, useEffect, useMemo } from 'react';
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
import { register, sendVerifyCode } from '../service/api';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { useToast } from '../components/Toast';
import { ThemeColors, useAppTheme } from '../theme';

type RegisterPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegisterPage'>;

interface RegisterFormData {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
	code: string;
}

const RegisterScreen = () => {
	const navigation = useNavigation<RegisterPageNavigationProp>();
	const insets = useSafeAreaInsets();
	const toast = useToast();
	const { colors, isDark } = useAppTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [codeCountdown, setCodeCountdown] = useState(0);
	const [canSendCode, setCanSendCode] = useState(true);

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
	const emailValue = watch('email');

	const handleSendCode = async () => {
		if (!emailValue || !/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(emailValue)) {
			toast.warning('验证邮箱', '请先输入有效的邮箱地址');
			return;
		}
		setCanSendCode(false);
		setCodeCountdown(60);
		try {
			await sendVerifyCode({ email: emailValue });
		} catch (error) {
			toast.error('发送失败', '发送验证码失败，请重试');
		}
	};

	useEffect(() => {
		if (codeCountdown > 0) {
			const timer = setTimeout(() => {
				setCodeCountdown(codeCountdown - 1);
			}, 1000);
			return () => clearTimeout(timer);
		} else {
			setCanSendCode(true);
		}
	}, [codeCountdown]);

	const onSubmit = async (data: RegisterFormData) => {
		setIsLoading(true);
		try {
			console.log('Register attempt with:', data.username, data.email, data.password);
			await register(data);
			toast.success('注册成功！', '欢迎使用 Vault');
		} catch (error) {
			toast.error('注册失败', '请稍后重试');
		} finally {
			navigation.navigate('LoginPage');
			setIsLoading(false);
		}
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.page} />

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
									<Ionicons name="lock-closed" size={48} color={colors.primary} />
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
											placeholderTextColor={colors.muted}
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
											color={colors.muted}
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
											placeholderTextColor={colors.muted}
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
											color={colors.muted}
											style={styles.inputIcon}
										/>
									</View>
									{errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
								</View>

								{/* 验证码输入框 */}
								<View style={styles.formGroup}>
									<Text style={styles.formLabel}>验证码</Text>
									<View style={styles.codeInputContainer}>
										<Controller
											control={control}
											rules={{
												required: '请输入验证码',
												minLength: {
													value: 6,
													message: '验证码长度为6位',
												},
												maxLength: {
													value: 6,
													message: '验证码长度为6位',
												},
											}}
											render={({ field: { onChange, onBlur, value } }) => (
												<TextInput
													style={styles.codeInput}
											placeholder="请输入验证码"
											placeholderTextColor={colors.muted}
													value={value}
													onChangeText={onChange}
													onBlur={onBlur}
													autoCapitalize="none"
													autoCorrect={false}
													keyboardType="numeric"
												/>
											)}
											name="code"
										/>
										<TouchableOpacity
											onPress={handleSendCode}
											disabled={!canSendCode}
											style={[styles.codeButton, !canSendCode && styles.codeButtonDisabled]}
										>
											<Text
												style={[
													styles.codeButtonText,
													!canSendCode && styles.codeButtonTextDisabled,
												]}
											>
												{codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
											</Text>
										</TouchableOpacity>
									</View>
									{errors.code && <Text style={styles.errorText}>{errors.code.message}</Text>}
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
											placeholderTextColor={colors.muted}
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
													color={colors.muted}
												/>
											</TouchableOpacity>
										</View>
									</View>
									{errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

									{/* 密码强度指示器 */}
									{passwordValue && passwordValue.length > 0 && (
										<PasswordStrengthIndicator password={passwordValue} />
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
											placeholderTextColor={colors.muted}
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
													color={colors.muted}
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
										color={colors.primary}
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
						<ActivityIndicator size="large" color={colors.primary} />
						<Text style={styles.loadingText}>正在创建账号...</Text>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.page,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		height: 56,
		backgroundColor: colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.surface,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: colors.text,
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
		backgroundColor: colors.primarySoft,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 4,
		borderColor: colors.border,
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
		color: colors.text,
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 14,
		color: colors.muted,
		textAlign: 'center',
	},
	// 表单容器
	formContainer: {
		backgroundColor: colors.card,
		borderRadius: 12,
		padding: 24,
		margin: 16,
		borderWidth: 1,
		borderColor: colors.border,
		width: '100%',
	},
	// 表单组
	formGroup: {
		marginBottom: 24,
	},
	formLabel: {
		fontSize: 10,
		fontWeight: 'bold',
		color: colors.muted,
		textTransform: 'uppercase',
		letterSpacing: 1,
		marginBottom: 8,
	},
	inputWithIcon: {
		position: 'relative',
	},
	formInput: {
		backgroundColor: colors.surface,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.border,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: colors.text,
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
	// 验证码容器
	codeInputContainer: {
		flexDirection: 'row',
		gap: 12,
	},
	codeInput: {
		flex: 1,
		backgroundColor: colors.surface,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.border,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: colors.text,
	},
	codeButton: {
		paddingHorizontal: 20,
		paddingVertical: 12,
		backgroundColor: colors.primary,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
	},
	codeButtonDisabled: {
		backgroundColor: colors.muted,
	},
	codeButtonText: {
		fontSize: 14,
		fontWeight: '500',
		color: 'white',
	},
	codeButtonTextDisabled: {
		color: colors.border,
	},
	// 安全提示
	securityWarning: {
		flexDirection: 'row',
		backgroundColor: colors.primarySoft,
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
		color: colors.primary,
		lineHeight: 20,
	},
	// 主按钮
	primaryButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		backgroundColor: colors.primary,
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
		backgroundColor: colors.card,
		padding: 20,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: 120,
	},
	loadingText: {
		marginTop: 12,
		fontSize: 16,
		color: colors.text,
		fontWeight: '500',
	},
});

export default RegisterScreen;
