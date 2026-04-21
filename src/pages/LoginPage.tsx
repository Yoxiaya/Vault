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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';

type LoginPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginPage'>;

const LoginScreen = () => {
	const navigation = useNavigation<LoginPageNavigationProp>();
	const insets = useSafeAreaInsets();
	const [accountId, setAccountId] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const handleLogin = () => {
		console.log('Login attempt with:', accountId, password);
	};

	const handleBiometricLogin = () => {
		console.log('Biometric login attempted');
	};

	const handleSignup = () => {
		console.log('Navigate to signup');
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
								<Text style={styles.title}>欢迎回来</Text>
								<Text style={styles.subtitle}>请输入您的主密码以访问数字保险库</Text>
							</View>

							{/* 登录表单卡片 */}
							<View style={styles.formContainer}>
								{/* 账号/邮箱输入框 */}
								<View style={styles.formGroup}>
									<Text style={styles.formLabel}>账号/邮箱</Text>
									<View style={styles.inputWithIcon}>
										<TextInput
											style={styles.formInput}
											placeholder="请输入账号或邮箱"
											value={accountId}
											onChangeText={setAccountId}
											autoCapitalize="none"
											autoCorrect={false}
										/>
										<Ionicons
											name="person-outline"
											size={20}
											color="#6b7280"
											style={styles.inputIcon}
										/>
									</View>
								</View>

								{/* 主密码输入框 */}
								<View style={styles.formGroup}>
									<Text style={styles.formLabel}>主密码</Text>
									<View style={styles.inputWithIcon}>
										<TextInput
											style={styles.formInput}
											placeholder="输入主密码"
											value={password}
											onChangeText={setPassword}
											secureTextEntry={!showPassword}
											autoCapitalize="none"
											autoCorrect={false}
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
								</View>

								{/* 主登录按钮 */}
								<TouchableOpacity onPress={handleLogin} style={styles.primaryButton}>
									<Text style={styles.primaryButtonText}>解锁保险库</Text>
									<AntDesign name="arrow-right" size={20} color="white" />
								</TouchableOpacity>

								{/* 分隔线 */}
								<View style={styles.dividerContainer}>
									<View style={styles.dividerLine} />
									<Text style={styles.dividerText}>或</Text>
									<View style={styles.dividerLine} />
								</View>

								{/* 生物识别登录按钮 */}
								<TouchableOpacity onPress={handleBiometricLogin} style={styles.secondaryButton}>
									<Ionicons name="finger-print" size={24} color="#3b82f6" />
									<Text style={styles.secondaryButtonText}>使用指纹登录</Text>
								</TouchableOpacity>
							</View>

							{/* 注册提示 */}
							<View style={styles.signupContainer}>
								<Text style={styles.signupText}>没有账号？ </Text>
								<TouchableOpacity onPress={handleSignup}>
									<Text style={styles.signupLink}>立即注册</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f9fafb',
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
		paddingHorizontal: 32,
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
		marginTop: 16,
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
	// 分隔线
	dividerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 24,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: '#e5e7eb',
	},
	dividerText: {
		marginHorizontal: 16,
		fontSize: 12,
		fontWeight: '500',
		color: '#6b7280',
	},
	// 次要按钮
	secondaryButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		backgroundColor: '#f3f4f6',
		borderRadius: 24,
		padding: 16,
	},
	secondaryButtonText: {
		fontSize: 16,
		fontWeight: '500',
		color: '#4b5563',
	},
	// 注册提示
	signupContainer: {
		marginTop: 24,
		marginBottom: 32,
		flexDirection: 'row',
		alignItems: 'center',
	},
	signupText: {
		fontSize: 14,
		color: '#6b7280',
	},
	signupLink: {
		fontSize: 14,
		fontWeight: '600',
		color: '#3b82f6',
	},
});

export default LoginScreen;
