import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	ScrollView,
	StyleSheet,
	Alert,
	ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { AccountCategory, UploadAccount } from '../types';
import { useAccountsStore } from '../store';
import { addAccount, updateAccount, uploadImage } from '../service/api';

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

	const {
		control,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<FormData>({
		defaultValues: {
			accountName: account?.appName || '',
			category: account?.category || 'other',
			webSite: account?.webSite || '',
			username: account?.username || '',
			password: account?.password || '',
			logoUrl: account?.logoUrl || '',
		},
	});

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
			// 立即显示选中的图片（本地预览）
			setValue('logoUrl', imageAsset.uri);
		}
	};

	// 保存或更新账号
	const onSubmit = async (data: FormData) => {
		if (isSubmitting) return;

		setIsSubmitting(true);

		try {
			let finalLogoUrl = data.logoUrl;

			// 只有在选择了新图片且与原有图片不同时才上传
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

	if (!account && mode === 'edit') {
		return (
			<View style={styles.errorContainer}>
				<Text>账号不存在</Text>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
									value={value}
									onChangeText={onChange}
									style={[styles.formInput, errors.accountName && styles.inputError]}
									editable={!isSubmitting}
								/>
							)}
						/>
						{errors.accountName && <Text style={styles.errorText}>{errors.accountName.message}</Text>}
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
										value={value}
										onChangeText={onChange}
										style={[styles.formInput, errors.webSite && styles.inputError]}
										placeholder="https://"
										editable={!isSubmitting}
									/>
									<Ionicons name="globe-outline" size={20} color="#6b7280" style={styles.inputIcon} />
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
										value={value}
										onChangeText={onChange}
										style={[styles.formInput, errors.username && styles.inputError]}
										editable={!isSubmitting}
									/>
									<Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
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
								<View style={styles.inputWithIcon}>
									<TextInput
										value={value}
										onChangeText={onChange}
										style={[styles.formInput, errors.password && styles.inputError]}
										secureTextEntry={!showPassword}
										editable={!isSubmitting}
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
							)}
						/>
						{errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

						{/* 密码强度提示（仅当有密码时显示） */}
						{control._formValues.password && control._formValues.password.length > 0 && (
							<View style={styles.strengthMeter}>
								<View
									style={[
										styles.strengthBar,
										control._formValues.password.length >= 6 && styles.strengthBarFull,
									]}
								/>
								<View
									style={[
										styles.strengthBar,
										control._formValues.password.length >= 8 && styles.strengthBarFull,
									]}
								/>
								<View
									style={[
										styles.strengthBar,
										control._formValues.password.length >= 10 && styles.strengthBarFull,
									]}
								/>
								<View
									style={[
										styles.strengthBar,
										control._formValues.password.length >= 12 && styles.strengthBarFull,
									]}
								/>
							</View>
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
								<View style={[styles.formInput, errors.category && styles.inputError]}>
									<Picker
										selectedValue={value}
										onValueChange={onChange}
										style={styles.picker}
										enabled={!isSubmitting}
									>
										<Picker.Item label="社交媒体" value="social" />
										<Picker.Item label="工作/开发" value="work" />
										<Picker.Item label="金融服务" value="finance" />
										<Picker.Item label="娱乐" value="entertainment" />
										<Picker.Item label="其他" value="other" />
									</Picker>
								</View>
							)}
						/>
						{errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}
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
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f9fafb',
		paddingTop: 16,
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
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: '#1f2937',
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
	strengthMeter: {
		flexDirection: 'row',
		gap: 4,
		height: 4,
		marginTop: 12,
	},
	strengthBar: {
		flex: 1,
		borderRadius: 2,
		backgroundColor: '#f3f4f6',
	},
	strengthBarFull: {
		backgroundColor: '#3b82f6',
	},
	actionsContainer: {
		flexDirection: 'row',
		gap: 16,
		padding: 16,
		paddingBottom: 32,
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
