import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { AccountCategory, UploadAccount } from '../types';
import { useAccountsStore } from '../store';
import { addAccount, updateAccount } from '../service/api';

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

	const [showPassword, setShowPassword] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			accountName: account?.appName || '',
			category: account?.category || 'other',
			webSite: account?.webSite || '',
			username: account?.username || '',
			password: account?.password || '',
		},
	});

	const onSubmit = async (data: FormData) => {
		// 这里可以添加保存逻辑
		console.log('Form submitted:', data);
		Alert.alert('成功', '账号信息已更新');
		if (mode === 'add') {
			const newAccount: UploadAccount = {
				appName: data.accountName,
				username: data.username,
				password: data.password,
				email: data?.email || '',
				webSite: data.webSite,
				category: data.category as AccountCategory,
				logoUrl: data?.logoUrl || '',
				lastUpdated: new Date().toLocaleDateString(),
				twoFactorEnabled: false,
				storageType: '明文存储',
			};
			await addAccount(newAccount);
		}
		if (mode === 'edit') {
			const updatedAccount: UploadAccount = {
				...account,
				appName: data.accountName,
				category: data.category as AccountCategory,
				webSite: data.webSite,
				username: data.username,
				password: data.password,
				lastUpdated: new Date().toLocaleDateString(),
				twoFactorEnabled: false,
				storageType: '明文存储',
			};
			await updateAccount(id, updatedAccount);
		}

		navigation.navigate('VaultPage');
	};

	if (!account && mode === 'edit')
		return (
			<View style={styles.errorContainer}>
				<Text>Account not found</Text>
			</View>
		);

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			{/* Icon Edit */}
			<View style={styles.iconSection}>
				<View style={styles.logoContainer}>
					{account?.logoUrl ? (
						<Image source={{ uri: account.logoUrl }} style={styles.logo} />
					) : (
						<Text style={styles.logoText}>{account?.appName[0]}</Text>
					)}
					<View style={styles.cameraOverlay}>
						<Ionicons name="camera" size={32} color="white" />
					</View>
					<TouchableOpacity style={styles.editButton}>
						<Ionicons name="create" size={16} color="white" />
					</TouchableOpacity>
				</View>
				<Text style={styles.changeIconText}>更换图标</Text>
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
									value: /^https?:\/\/.*/,
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
							)}
						/>
						{errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
						{/* Strength Meter */}
						<View style={styles.strengthMeter}>
							<View style={[styles.strengthBar, styles.strengthBarFull]} />
							<View style={[styles.strengthBar, styles.strengthBarFull]} />
							<View style={[styles.strengthBar, styles.strengthBarFull]} />
							<View style={[styles.strengthBar, styles.strengthBarEmpty]} />
						</View>
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
									<Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
										<Picker.Item label="社交媒体" value="social" style={styles.pickerItem} />
										<Picker.Item label="工作/开发" value="work" style={styles.pickerItem} />
										<Picker.Item label="金融服务" value="finance" style={styles.pickerItem} />
										<Picker.Item label="娱乐" value="entertainment" style={styles.pickerItem} />
										<Picker.Item label="其他" value="other" style={styles.pickerItem} />
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
				<TouchableOpacity style={styles.primaryButton} onPress={handleSubmit(onSubmit)}>
					<Ionicons name="checkmark-circle" size={20} color="white" />
					<Text style={styles.primaryButtonText}>保存修改</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
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
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		margin: 16,
		backgroundColor: '#f3f4f6',
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
	cameraOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.2)',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 64,
		opacity: 0,
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
	},
	changeIconText: {
		fontSize: 14,
		fontWeight: '500',
		color: '#3b82f6',
		letterSpacing: 0.5,
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
	selectContainer: {
		position: 'relative',
	},
	selectIcon: {
		position: 'absolute',
		right: 16,
		top: 12,
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
	},
	strengthBarFull: {
		backgroundColor: '#3b82f6',
	},
	strengthBarEmpty: {
		backgroundColor: '#f3f4f6',
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
	pickerItem: {
		fontSize: 16,
	},
});
