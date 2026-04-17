import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
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
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { ACCOUNT_CATEGORIES, AccountCategory, UploadAccount } from '../types';
import { useAccountsStore } from '../store';
import { addAccount, updateAccount, uploadImage, deleteImage } from '../service/api';
import { calculatePasswordStrength } from '../utils';
import { LoadingMask } from '../components/Mask';

type EditAccountPageRouteProp = RouteProp<RootStackParamList, 'EditAccount'>;
type EditAccountPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditAccount'>;

type FormData = {
	accountName: string;
	category: string;
	webSite: string;
	username: string;
	password: string;
	email?: string;
	logoUrl?: string;
	description?: string;
};

export default function EditAccountPage() {
	const route = useRoute<EditAccountPageRouteProp>();
	const navigation = useNavigation<EditAccountPageNavigationProp>();
	const { id, mode } = route.params;
	const { getAccountDetailById } = useAccountsStore();

	const account = getAccountDetailById(id);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
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

	// 用于滚动到当前输入框的 ref
	const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
	const inputRefs = useRef<{ [key: string]: any }>({});

	const {
		control,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<FormData>({
		defaultValues: {
			accountName: account?.appName || '',
			category: account?.category || 'other',
			webSite: account?.webSite || '',
			username: account?.username || '',
			password: account?.password || '',
			logoUrl: account?.logoUrl || '',
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

	// 上传图片到服务器
	const uploadImageToServer = async (imageAsset: ImagePicker.ImagePickerAsset): Promise<string> => {
		const formData = new FormData();
		formData.append('file', {
			uri: imageAsset.uri,
			name: imageAsset.fileName || `photo_${Date.now()}.jpg`,
			type: imageAsset.mimeType || 'image/jpeg',
		} as any);

		const result = await uploadImage(formData);
		return result.data.url;
	};

	// 删除图片
	const deleteImageToServer = async (url: string) => {
		const formData = new FormData();
		formData.append('url', url);
		await deleteImage(formData);
	};

	// 处理图片选择
	const handlePickImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('需要权限', '请允许访问相册以更换图标');
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets?.[0]) {
			const imageAsset = result.assets[0];
			setSelectedImage(imageAsset);
			setValue('logoUrl', imageAsset.uri);
		}
	};

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
			let finalLogoUrl = data.logoUrl;
			if (account && account.logoUrl && data.logoUrl !== account.logoUrl) {
				await deleteImageToServer(account.logoUrl);
			}

			if (selectedImage && selectedImage.uri !== account?.logoUrl) {
				try {
					const uploadedUrl = await uploadImageToServer(selectedImage);
					finalLogoUrl = uploadedUrl;
				} catch (uploadError) {
					console.error('图片上传失败:', uploadError);
					Alert.alert('警告', '图片上传失败，将继续保存其他信息');
				}
			}

			const baseAccountData = {
				appName: data.accountName,
				username: data.username,
				password: data.password,
				email: data?.email || '',
				webSite: data.webSite,
				category: data.category as AccountCategory,
				logoUrl: finalLogoUrl,
				description: data.description || '',
				lastUpdated: new Date().toLocaleDateString(),
				twoFactorEnabled: false,
				storageType: '明文存储',
			};

			if (mode === 'add') {
				await addAccount(baseAccountData as UploadAccount);
				Alert.alert('成功', '账号已添加');
			} else if (mode === 'edit' && account) {
				const updatedAccount: UploadAccount = {
					...account,
					...baseAccountData,
				};
				await updateAccount(id, updatedAccount);
				Alert.alert('成功', '账号信息已更新');
			}

			navigation.navigate('VaultPage');
		} catch (error) {
			console.error('保存失败:', error);
			Alert.alert('错误', '保存失败，请重试');
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
					},
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
						{/* Icon Edit */}
						<View style={styles.iconSection}>
							<Controller
								control={control}
								name="logoUrl"
								render={({ field: { value } }) => (
									<View style={styles.logoContainer}>
										{value ? (
											<Image source={{ uri: value }} style={styles.logo} />
										) : (
											<Text style={styles.logoText}>{account?.appName?.[0] || '?'}</Text>
										)}
										<TouchableOpacity
											style={styles.editButton}
											onPress={handlePickImage}
											disabled={isSubmitting}
										>
											<Ionicons name="create" size={16} color="white" />
										</TouchableOpacity>
									</View>
								)}
							/>
						</View>

						{/* Form */}
						<View style={styles.formContainer}>
							<View style={styles.formGrid}>
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
												style={[styles.formInput, errors.accountName && styles.inputError]}
												editable={!isSubmitting}
												placeholder="请输入账号名称"
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
											<View style={[styles.formSelect, errors.category && styles.inputError]}>
												<Picker
													selectedValue={value}
													onValueChange={onChange}
													style={styles.picker}
													enabled={!isSubmitting}
												>
													{Object.entries(ACCOUNT_CATEGORIES).map(([category, label]) => (
														<Picker.Item label={label} value={category} />
													))}
												</Picker>
											</View>
										)}
									/>
									{errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}
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
													style={[styles.formInput, errors.webSite && styles.inputError]}
													placeholder="https://"
													editable={!isSubmitting}
												/>
												<Ionicons
													name="globe-outline"
													size={20}
													color="#6b7280"
													style={styles.inputIcon}
												/>
											</View>
										)}
									/>
									{errors.webSite && <Text style={styles.errorText}>{errors.webSite.message}</Text>}
								</View>

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
													style={[styles.formInput, errors.username && styles.inputError]}
													editable={!isSubmitting}
													placeholder="请输入用户名或邮箱"
												/>
												<Ionicons
													name="mail-outline"
													size={20}
													color="#6b7280"
													style={styles.inputIcon}
												/>
											</View>
										)}
									/>
									{errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}
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
														style={[styles.formInput, errors.password && styles.inputError]}
														secureTextEntry={!showPassword}
														editable={!isSubmitting}
														placeholder="请输入密码"
													/>
													<View style={styles.passwordActions}>
														<TouchableOpacity
															onPress={() => setShowPassword(!showPassword)}
															disabled={isSubmitting}
														>
															<Ionicons
																name={showPassword ? 'eye-off-outline' : 'eye-outline'}
																size={20}
																color="#6b7280"
															/>
														</TouchableOpacity>
													</View>
												</View>

												{/* 密码强度指示器 */}
												{passwordValue && passwordValue.length > 0 && (
													<View style={styles.strengthContainer}>
														<View style={styles.strengthMeter}>
															{[1, 2, 3, 4, 5].map((index) => (
																<View
																	key={index}
																	style={[
																		styles.strengthBar,
																		index <= passwordStrength.score && {
																			backgroundColor: passwordStrength.color,
																		},
																		index > passwordStrength.score &&
																			styles.strengthBarEmpty,
																	]}
																/>
															))}
														</View>
														<View style={styles.strengthInfo}>
															<Text
																style={[
																	styles.strengthText,
																	{ color: passwordStrength.color },
																]}
															>
																密码强度：{passwordStrength.level}
															</Text>
															<Text style={styles.strengthFeedback}>
																{passwordStrength.feedback}
															</Text>
														</View>
													</View>
												)}
											</View>
										)}
									/>
									{errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
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
										<Text style={styles.primaryButtonText}>保存修改</Text>
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
		backgroundColor: '#f9fafb',
	},
	scrollContent: {
		flexGrow: 1,
		paddingTop: 16,
		paddingBottom: Platform.OS === 'ios' ? 40 : 20,
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconSection: {
		alignItems: 'center',
		gap: 16,
		padding: 16,
	},
	logoContainer: {
		position: 'relative',
		width: 128,
		height: 128,
		borderRadius: 64,
		backgroundColor: '#f3f4f6',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 4,
		borderColor: '#f9fafb',
	},
	logo: {
		width: 128,
		height: 128,
		borderRadius: 64,
		opacity: 0.8,
	},
	logoText: {
		fontSize: 40,
		fontWeight: 'bold',
		color: '#3b82f6',
	},
	editButton: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		backgroundColor: '#3b82f6',
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: 'white',
	},
	formContainer: {
		backgroundColor: '#f9fafb',
		borderRadius: 12,
		padding: 24,
		margin: 16,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	formGrid: {
		gap: 24,
	},
	formGroup: {
		gap: 8,
	},
	fullWidth: {
		width: '100%',
	},
	formLabel: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#6b7280',
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	formInput: {
		backgroundColor: '#f3f4f6',
		borderRadius: 8,
		paddingVertical: 12,
		paddingLeft: 16,
		paddingRight: 44,
		fontSize: 16,
		color: '#1f2937',
	},
	formSelect: {
		backgroundColor: '#f3f4f6',
		borderRadius: 8,
		paddingLeft: 16,
		paddingRight: 6,
		paddingVertical: 12,
		fontSize: 16,
		color: '#1f2937',
	},
	textArea: {
		backgroundColor: '#f3f4f6',
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 16,
		fontSize: 16,
		color: '#1f2937',
		minHeight: 100,
		textAlignVertical: 'top',
	},
	inputWithIcon: {
		position: 'relative',
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
	strengthContainer: {
		marginTop: 12,
		gap: 8,
	},
	strengthMeter: {
		flexDirection: 'row',
		gap: 6,
		height: 6,
	},
	strengthBar: {
		flex: 1,
		borderRadius: 3,
		height: 6,
	},
	strengthBarEmpty: {
		backgroundColor: '#f3f4f6',
	},
	strengthInfo: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	strengthText: {
		fontSize: 12,
		fontWeight: '600',
	},
	strengthFeedback: {
		fontSize: 11,
		color: '#6b7280',
	},
	actionsContainer: {
		flexDirection: 'row',
		gap: 16,
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
	secondaryButton: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#f3f4f6',
		borderRadius: 24,
		padding: 16,
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
	picker: {
		fontSize: 12,
	},
	disabledButton: {
		opacity: 0.6,
	},
});
