import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { AccountCategory } from '../type';
import { useAccountsStore } from '../store';
import { addAccount, updateAccount } from '../service/api';
import { calculatePasswordStrength } from '../utils';
import { LoadingMask } from '../components/Mask';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { useToast } from '../components/Toast';
import CategoryPicker, { CategoryOption } from '../components/CategoryPicker';
import { cardStyles, colors } from '../theme';

type EditAccountPageRouteProp = RouteProp<RootStackParamList, 'EditAccount'>;
type EditAccountPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditAccount'>;

type FormData = {
	accountName: string;
	category: string;
	webSite: string;
	username: string;
	password: string;
	email?: string;
	description?: string;
};

export default function EditAccountPage() {
	const route = useRoute<EditAccountPageRouteProp>();
	const navigation = useNavigation<EditAccountPageNavigationProp>();
	const { id, mode } = route.params;
	const { getAccountDetailById } = useAccountsStore();
	const toast = useToast();

	const account = getAccountDetailById(id);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState<{
		score: number;
		level: string;
		color: string;
		feedback: string;
	}>({
		score: 0,
		level: '无',
		color: '#e5e7eb',
		feedback: '请输入密码',
	});

	const categoryOptions: CategoryOption[] = [
		{ key: 'social', label: '社交', icon: 'people-outline', color: '#8b5cf6' },
		{ key: 'work', label: '工作', icon: 'briefcase-outline', color: '#3b82f6' },
		{ key: 'finance', label: '财务', icon: 'card-outline', color: '#10b981' },
		{ key: 'entertainment', label: '娱乐', icon: 'game-controller-outline', color: '#f59e0b' },
		{ key: 'other', label: '其他', icon: 'apps-outline', color: '#6b7280' },
	];

	// 用于滚动到当前输入框的 ref
	const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
	const inputRefs = useRef<{ [key: string]: any }>({});

	const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<FormData>({
		defaultValues: {
			accountName: account?.appName || '',
			category: account?.category || 'other',
			webSite: account?.webSite || '',
			username: account?.username || '',
			password: account?.password || '',
			description: account?.description || '',
		},
	});

	// 监听密码变化
	const passwordValue = watch('password');

	// 实时计算密码强度
	useEffect(() => {
		if (passwordValue) {
			const strength = calculatePasswordStrength(passwordValue);
			setPasswordStrength(strength);
		} else {
			setPasswordStrength({
				score: 0,
				level: '无',
				color: '#e5e7eb',
				feedback: '请输入密码',
			});
		}
	}, [passwordValue]);

	// 保存或更新账号
	const onSubmit = async (data: FormData) => {
		if (isSubmitting) return;

		// 密码强度检查（可选）
		if (passwordStrength.score < 2) {
			Alert.alert('密码强度过低', '您的密码强度较弱，建议使用更强的密码以提高安全性。是否继续保存？', [
				{ text: '取消', style: 'cancel' },
				{ text: '继续保存', onPress: () => saveAccount(data) },
			]);
			return;
		}

		await saveAccount(data);
	};

	const saveAccount = async (data: FormData) => {
		setIsSubmitting(true);
		try {
			const baseAccountData = {
				appName: data.accountName,
				username: data.username,
				password: data.password,
				email: data?.email || '',
				webSite: data.webSite,
				category: data.category as AccountCategory,
				description: data.description || '',
				lastUpdated: new Date().toISOString(),
				twoFactorEnabled: false,
			};

			if (mode === 'add') {
				const { success } = await addAccount(baseAccountData);
				if (success) {
					toast.success('添加成功', '账号已添加到 Vault');
				}
			} else if (mode === 'edit' && account) {
				const { success } = await updateAccount(id, baseAccountData);
				if (success) {
					toast.success('更新成功', '账号信息已更新');
				}
			}

			navigation.navigate('VaultPage');
		} catch (error) {
			console.error('保存失败:', error);
			toast.error('保存失败', '请检查网络后重试');
		} finally {
			setIsSubmitting(false);
		}
	};

	// 处理输入框聚焦，自动滚动到可见区域
	const handleInputFocus = (inputName: string) => {
		// 使用 setTimeout 确保键盘已经弹出
		setTimeout(() => {
			if (inputRefs.current[inputName]) {
				// 使用 measure 方法获取输入框的位置
				inputRefs.current[inputName].measure(
					(x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
						// 滚动到输入框位置，减去一些偏移量使其更靠上
						scrollViewRef.current?.scrollToPosition(0, pageY - 120, true);
					}
				);
			}
		}, 300);
	};

	if (!account && mode === 'edit') {
		return (
			<View style={styles.errorContainer}>
				<Text>账号不存在</Text>
			</View>
		);
	}

	return (
		<>
			<KeyboardAvoidingView
				style={styles.keyboardAvoidingView}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<KeyboardAwareScrollView
						ref={scrollViewRef}
						style={styles.container}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
						enableOnAndroid={true}
						extraScrollHeight={Platform.OS === 'ios' ? 120 : 120}
						enableResetScrollToCoords={false}
						scrollEnabled={true}
						contentContainerStyle={styles.scrollContent}
					>
						<View style={styles.pageIntro}>
							<View style={styles.introIcon}>
								<Ionicons
									name={mode === 'add' ? 'add' : 'create-outline'}
									size={24}
									color={colors.primary}
								/>
							</View>
							<View style={styles.introContent}>
								<Text style={styles.introTitle}>{mode === 'add' ? '添加新账户' : '编辑账户信息'}</Text>
								<Text style={styles.introDescription}>完善账户信息，方便日后快速查找和使用</Text>
							</View>
						</View>

						{/* Form */}
						<View style={styles.formContainer}>
							<View style={styles.formGrid}>
								<View style={styles.sectionCard}>
									<View style={styles.sectionHeading}>
										<Ionicons name="apps-outline" size={20} color={colors.primary} />
										<Text style={styles.sectionTitle}>基础信息</Text>
									</View>
									<View style={styles.sectionFields}>
										{/* Account Name */}
										<View style={styles.formGroup}>
											<Text style={styles.formLabel}>账号名称</Text>
											<Controller
												control={control}
												name="accountName"
												rules={{ required: '账号名称不能为空' }}
												render={({ field: { onChange, value } }) => (
													<TextInput
														//@ts-ignore
														ref={(ref) => (inputRefs.current.accountName = ref)}
														value={value}
														onChangeText={onChange}
														onFocus={() => handleInputFocus('accountName')}
														style={[
															styles.formInput,
															errors.accountName && styles.inputError,
														]}
														editable={!isSubmitting}
														placeholder="请输入账号名称"
														placeholderTextColor="#98A2B3"
														returnKeyType="next"
													/>
												)}
											/>
											{errors.accountName && (
												<Text style={styles.errorText}>{errors.accountName.message}</Text>
											)}
										</View>

										{/* Category */}
										<View style={styles.formGroup}>
											<Text style={styles.formLabel}>账号类型</Text>
											<Controller
												control={control}
												name="category"
												rules={{ required: '账号类型不能为空' }}
												render={({ field: { value, onChange } }) => (
													<CategoryPicker
														value={value}
														options={categoryOptions}
														onChange={onChange}
														disabled={isSubmitting}
														hasError={!!errors.category}
													/>
												)}
											/>
											{errors.category && (
												<Text style={styles.errorText}>{errors.category.message}</Text>
											)}
										</View>

										{/* Website */}
										<View style={styles.formGroup}>
											<Text style={styles.formLabel}>官方网址</Text>
											<Controller
												control={control}
												name="webSite"
												rules={{
													pattern: {
														value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
														message: '请输入有效的网址',
													},
												}}
												render={({ field: { onChange, value } }) => (
													<View style={styles.inputWithIcon}>
														<TextInput
															//@ts-ignore
															ref={(ref) => (inputRefs.current.webSite = ref)}
															value={value}
															onChangeText={onChange}
															onFocus={() => handleInputFocus('webSite')}
															style={[
																styles.formInput,
																errors.webSite && styles.inputError,
															]}
															placeholder="https://"
															placeholderTextColor="#98A2B3"
															editable={!isSubmitting}
															keyboardType="url"
															autoCapitalize="none"
															autoCorrect={false}
														/>
														<Ionicons
															name="globe-outline"
															size={20}
															color={colors.primary}
															style={styles.inputIcon}
														/>
													</View>
												)}
											/>
											{errors.webSite && (
												<Text style={styles.errorText}>{errors.webSite.message}</Text>
											)}
										</View>
									</View>
								</View>

								<View style={styles.sectionCard}>
									<View style={styles.sectionHeading}>
										<Ionicons name="key-outline" size={20} color={colors.primary} />
										<Text style={styles.sectionTitle}>登录凭据</Text>
									</View>
									<View style={styles.sectionFields}>
										{/* Username */}
										<View style={styles.formGroup}>
											<Text style={styles.formLabel}>用户名 / 邮箱</Text>
											<Controller
												control={control}
												name="username"
												rules={{ required: '用户名不能为空' }}
												render={({ field: { onChange, value } }) => (
													<View style={styles.inputWithIcon}>
														<TextInput
															//@ts-ignore
															ref={(ref) => (inputRefs.current.username = ref)}
															value={value}
															onChangeText={onChange}
															onFocus={() => handleInputFocus('username')}
															style={[
																styles.formInput,
																errors.username && styles.inputError,
															]}
															editable={!isSubmitting}
															placeholder="请输入用户名或邮箱"
															placeholderTextColor="#98A2B3"
															autoCapitalize="none"
															autoCorrect={false}
														/>
														<Ionicons
															name="mail-outline"
															size={20}
															color={colors.primary}
															style={styles.inputIcon}
														/>
													</View>
												)}
											/>
											{errors.username && (
												<Text style={styles.errorText}>{errors.username.message}</Text>
											)}
										</View>

										{/* Password */}
										<View style={[styles.formGroup, styles.fullWidth]}>
											<Text style={styles.formLabel}>密码</Text>
											<Controller
												control={control}
												name="password"
												rules={{
													required: '密码不能为空',
													minLength: {
														value: 6,
														message: '密码至少6位',
													},
												}}
												render={({ field: { onChange, value } }) => (
													<View>
														<View style={styles.inputWithIcon}>
															<TextInput
																//@ts-ignore
																ref={(ref) => (inputRefs.current.password = ref)}
																value={value}
																onChangeText={onChange}
																onFocus={() => handleInputFocus('password')}
																style={[
																	styles.formInput,
																	errors.password && styles.inputError,
																]}
																secureTextEntry={!showPassword}
																editable={!isSubmitting}
																placeholder="请输入密码"
																placeholderTextColor="#98A2B3"
																autoCapitalize="none"
																autoCorrect={false}
															/>
															<View style={styles.passwordActions}>
																<TouchableOpacity
																	onPress={() => setShowPassword(!showPassword)}
																	disabled={isSubmitting}
																>
																	<Ionicons
																		name={
																			showPassword
																				? 'eye-off-outline'
																				: 'eye-outline'
																		}
																		size={20}
																		color={colors.primary}
																	/>
																</TouchableOpacity>
															</View>
														</View>

														{/* 密码强度指示器 */}
														{passwordValue && passwordValue.length > 0 && (
															<PasswordStrengthIndicator password={passwordValue} />
														)}
													</View>
												)}
											/>
											{errors.password && (
												<Text style={styles.errorText}>{errors.password.message}</Text>
											)}
										</View>
									</View>
								</View>

								<View style={styles.sectionCard}>
									<View style={styles.sectionHeading}>
										<Ionicons name="document-text-outline" size={20} color={colors.primary} />
										<Text style={styles.sectionTitle}>备注</Text>
									</View>
									{/* 账号描述 - Textarea */}
									<View style={[styles.formGroup, styles.fullWidth]}>
										<Text style={styles.formLabel}>账号描述</Text>
										<Controller
											control={control}
											name="description"
											render={({ field: { onChange, value } }) => (
												<TextInput
													//@ts-ignore
													ref={(ref) => (inputRefs.current.description = ref)}
													value={value}
													onChangeText={onChange}
													onFocus={() => handleInputFocus('description')}
													style={[styles.textArea, errors.description && styles.inputError]}
													placeholder="添加账号描述、备注信息..."
													placeholderTextColor="#98A2B3"
													multiline={true}
													numberOfLines={4}
													textAlignVertical="top"
													editable={!isSubmitting}
												/>
											)}
										/>
									</View>
								</View>
							</View>
						</View>

						{/* Actions */}
						<View style={styles.actionsContainer}>
							<TouchableOpacity
								style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
								onPress={handleSubmit(onSubmit)}
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<ActivityIndicator color="white" size="small" />
								) : (
									<>
										<Ionicons name="checkmark-circle" size={20} color="white" />
										<Text style={styles.primaryButtonText}>
											{mode === 'add' ? '添加账户' : '保存修改'}
										</Text>
									</>
								)}
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.secondaryButton}
								onPress={() => navigation.goBack()}
								disabled={isSubmitting}
							>
								<Text style={styles.secondaryButtonText}>取消</Text>
							</TouchableOpacity>
						</View>
					</KeyboardAwareScrollView>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
			<LoadingMask visible={isSubmitting} />
		</>
	);
}

const styles = StyleSheet.create({
	keyboardAvoidingView: {
		flex: 1,
	},
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	scrollContent: {
		flexGrow: 1,
		paddingTop: 12,
		paddingBottom: Platform.OS === 'ios' ? 40 : 20,
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	pageIntro: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	introIcon: {
		width: 48,
		height: 48,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.primarySoft,
	},
	introContent: {
		flex: 1,
		gap: 3,
	},
	introTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: colors.text,
	},
	introDescription: {
		fontSize: 13,
		lineHeight: 18,
		color: colors.muted,
	},
	formContainer: {
		paddingHorizontal: 16,
		paddingTop: 8,
	},
	formGrid: {
		gap: 14,
	},
	sectionCard: {
		...cardStyles.base,
		padding: 16,
		gap: 18,
	},
	sectionHeading: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '700',
		color: colors.text,
	},
	sectionFields: {
		gap: 18,
	},
	formGroup: {
		gap: 8,
	},
	fullWidth: {
		width: '100%',
	},
	formLabel: {
		fontSize: 13,
		fontWeight: '600',
		color: colors.muted,
	},
	formInput: {
		backgroundColor: colors.surface,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.border,
		minHeight: 52,
		paddingVertical: 13,
		paddingLeft: 16,
		paddingRight: 44,
		fontSize: 16,
		color: colors.text,
	},
	textArea: {
		backgroundColor: colors.surface,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.border,
		paddingVertical: 12,
		paddingHorizontal: 16,
		fontSize: 16,
		color: colors.text,
		minHeight: 100,
		textAlignVertical: 'top',
	},
	inputWithIcon: {
		position: 'relative',
	},
	inputIcon: {
		position: 'absolute',
		right: 16,
		top: 16,
	},
	passwordActions: {
		position: 'absolute',
		right: 6,
		top: 4,
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 12,
	},
	actionsContainer: {
		flexDirection: 'row',
		gap: 12,
		padding: 16,
		paddingBottom: 32,
		marginBottom: Platform.OS === 'ios' ? 20 : 0,
	},
	primaryButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		backgroundColor: '#3b82f6',
		minHeight: 52,
		borderRadius: 14,
		padding: 14,
	},
	primaryButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: 'white',
	},
	secondaryButton: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		minHeight: 52,
		padding: 14,
	},
	secondaryButtonText: {
		fontSize: 16,
		fontWeight: '500',
		color: '#4b5563',
	},
	inputError: {
		borderColor: '#ef4444',
		borderWidth: 1,
	},
	errorText: {
		fontSize: 12,
		color: '#ef4444',
		marginTop: 4,
	},
	disabledButton: {
		opacity: 0.6,
	},
});
