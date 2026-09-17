import React, { useMemo, useState } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { login } from '../service/api';
import { useAuth } from '../context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { useToast } from '../components/Toast';
import { ThemeColors, useAppTheme } from '../theme';

type LoginPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginPage'>;

interface LoginFormData {
	accountId: string;
	password: string;
}

const LoginScreen = () => {
	const navigation = useNavigation<LoginPageNavigationProp>();
	const insets = useSafeAreaInsets();
	const { signIn } = useAuth();
	const toast = useToast();
	const { colors, isDark } = useAppTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		defaultValues: {
			accountId: '',
			password: '',
		},
	});

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);
		try {
			const result = await login({ account: data.accountId, password: data.password, clientType: 'app' });
			if (result.success && result.data) {
				// result.data 为标准 JWT 三段格式 token 字符串
				await signIn(result.data, data.password);
			} else {
				toast.error('登录失败', result.message);
			}
		} catch (error) {
			console.log(error);
			toast.error('登录失败', '请检查网络或稍后重试');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSignup = () => {
		navigation.navigate('RegisterPage');
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.page} />
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
				<View style={styles.contentContainer}>
					{/* 头部区域：登录标题 + 欢迎小字 */}
					<View style={styles.headerSection}>
						<Text style={styles.loginTitle}>登录</Text>
						<Text style={styles.welcomeText}>您好，欢迎使用Vault</Text>
					</View>

					{/* 表单区域 */}
					<View style={styles.formWrapper}>
						{/* 账号/邮箱输入框 */}
						<View style={styles.inputGroup}>
							<Controller
								control={control}
								rules={{
									required: '账号/邮箱不能为空',
									pattern: {
										value: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$|^[a-zA-Z0-9_]{3,20}$/,
										message: '请输入有效的邮箱或账号',
									},
								}}
								render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
									<>
										<View style={[styles.inputContainer, error && styles.inputContainerError]}>
											<Ionicons
												name="person-outline"
												size={20}
												color={colors.muted}
												style={styles.inputLeftIcon}
											/>
											<TextInput
												style={styles.input}
												placeholder="账号/邮箱"
												placeholderTextColor={colors.muted}
												value={value}
												onChangeText={onChange}
												onBlur={onBlur}
												autoCapitalize="none"
												autoCorrect={false}
												importantForAutofill="yes"
											/>
										</View>
										{error && <Text style={styles.errorText}>{error.message}</Text>}
									</>
								)}
								name="accountId"
							/>
						</View>

						{/* 密码输入框 */}
						<View style={styles.inputGroup}>
							<Controller
								control={control}
								rules={{
									required: '密码不能为空',
									minLength: {
										value: 6,
										message: '密码至少6位',
									},
								}}
								render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
									<>
										<View style={[styles.inputContainer, error && styles.inputContainerError]}>
											<Ionicons
												name="lock-closed-outline"
												size={20}
												color={colors.muted}
												style={styles.inputLeftIcon}
											/>
											<TextInput
												style={[styles.input, styles.passwordInput]}
												placeholder="密码"
												placeholderTextColor={colors.muted}
												value={value}
												onChangeText={onChange}
												onBlur={onBlur}
												secureTextEntry={!showPassword}
												autoCapitalize="none"
												autoCorrect={false}
												importantForAutofill="yes"
											/>
											<TouchableOpacity
												onPress={() => setShowPassword(!showPassword)}
												style={styles.eyeButton}
											>
												<Ionicons
													name={showPassword ? 'eye-off-outline' : 'eye-outline'}
													size={20}
													color={colors.muted}
												/>
											</TouchableOpacity>
										</View>
										{error && <Text style={styles.errorText}>{error.message}</Text>}
									</>
								)}
								name="password"
							/>
						</View>

						{/* 登录按钮 */}
						<TouchableOpacity
							onPress={handleSubmit(onSubmit)}
							style={styles.loginButton}
							activeOpacity={0.8}
							disabled={isLoading}
						>
							{isLoading ? (
								<ActivityIndicator color="#ffffff" size="small" />
							) : (
								<Text style={styles.loginButtonText}>登录</Text>
							)}
						</TouchableOpacity>

						{/* 注册链接 */}
						<TouchableOpacity onPress={handleSignup} style={styles.signupButton}>
							<Text style={styles.signupText}>
								没有账号？ <Text style={styles.signupLink}>立即注册</Text>
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</View>
	);
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.page,
	},
	keyboardView: {
		flex: 1,
	},
	contentContainer: {
		flex: 1,
		paddingHorizontal: 24,
	},
	// 头部区域
	headerSection: {
		marginTop: 60,
		marginBottom: 48,
	},
	loginTitle: {
		fontSize: 34,
		fontWeight: '700',
		color: colors.text,
		marginBottom: 8,
	},
	welcomeText: {
		fontSize: 14,
		color: colors.muted,
	},
	// 表单区域
	formWrapper: {
		width: '100%',
	},
	inputGroup: {
		marginBottom: 20,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 12,
		backgroundColor: colors.surface,
		height: 48,
	},
	inputContainerError: {
		borderColor: '#ef4444',
		backgroundColor: colors.surface,
	},
	inputLeftIcon: {
		marginLeft: 16,
		marginRight: 8,
	},
	input: {
		flex: 1,
		fontSize: 16,
		color: colors.text,
		paddingVertical: 12,
		paddingRight: 16,
	},
	passwordInput: {
		paddingRight: 48,
	},
	eyeButton: {
		position: 'absolute',
		right: 16,
		padding: 4,
	},
	errorText: {
		color: '#ef4444',
		fontSize: 12,
		marginTop: 6,
		marginLeft: 12,
	},
	loginButton: {
		backgroundColor: colors.primary,
		borderRadius: 24,
		height: 52,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 8,
		shadowColor: colors.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
	},
	loginButtonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '600',
	},
	signupButton: {
		alignItems: 'center',
		marginTop: 24,
		paddingVertical: 12,
	},
	signupText: {
		fontSize: 14,
		color: colors.muted,
	},
	signupLink: {
		color: colors.primary,
		fontWeight: '500',
	},
});

export default LoginScreen;
