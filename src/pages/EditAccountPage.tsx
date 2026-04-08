import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MOCK_ACCOUNTS } from '../types';
import { RootStackParamList } from '../App';

type EditAccountPageRouteProp = RouteProp<RootStackParamList, 'EditAccount'>;
type EditAccountPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditAccount'>;

export default function EditAccountPage() {
	const route = useRoute<EditAccountPageRouteProp>();
	const navigation = useNavigation<EditAccountPageNavigationProp>();
	const { id } = route.params;
	const account = MOCK_ACCOUNTS.find((a) => a.id === id);

	const [accountName, setAccountName] = useState(account?.name || '');
	const [category, setCategory] = useState(account?.category || 'other');
	const [website, setWebsite] = useState(account?.website || '');
	const [username, setUsername] = useState(account?.username || '');
	const [password, setPassword] = useState(account?.password || '');
	const [showPassword, setShowPassword] = useState(false);

	if (!account)
		return (
			<View style={styles.errorContainer}>
				<Text>Account not found</Text>
			</View>
		);

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			{/* Header */}
			{/* <TouchableOpacity 
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#6b7280" />
      </TouchableOpacity> */}

			{/* Icon Edit */}
			<View style={styles.iconSection}>
				<View style={styles.logoContainer}>
					{account.logoUrl ? (
						<Image source={{ uri: account.logoUrl }} style={styles.logo} />
					) : (
						<Text style={styles.logoText}>{account.name[0]}</Text>
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
						<TextInput value={accountName} onChangeText={setAccountName} style={styles.formInput} />
					</View>
					{/* Category */}
					<View style={styles.formGroup}>
						<Text style={styles.formLabel}>账号类型</Text>
						<View style={styles.selectContainer}>
							<TextInput
								value={
									category === 'social'
										? '社交媒体'
										: category === 'work'
											? '工作/开发'
											: category === 'finance'
												? '金融服务'
												: category === 'entertainment'
													? '娱乐'
													: '其他'
								}
								editable={false}
								style={styles.formInput}
							/>
							<Ionicons name="chevron-down" size={20} color="#6b7280" style={styles.selectIcon} />
						</View>
					</View>
					{/* Website */}
					<View style={styles.formGroup}>
						<Text style={styles.formLabel}>官方网址</Text>
						<View style={styles.inputWithIcon}>
							<TextInput
								value={website}
								onChangeText={setWebsite}
								style={styles.formInput}
								placeholder="https://"
							/>
							<Ionicons name="globe-outline" size={20} color="#6b7280" style={styles.inputIcon} />
						</View>
					</View>
					{/* Username */}
					<View style={styles.formGroup}>
						<Text style={styles.formLabel}>用户名 / 邮箱</Text>
						<View style={styles.inputWithIcon}>
							<TextInput value={username} onChangeText={setUsername} style={styles.formInput} />
							<Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
						</View>
					</View>
					{/* Password */}
					<View style={[styles.formGroup, styles.fullWidth]}>
						<Text style={styles.formLabel}>密码</Text>
						<View style={styles.inputWithIcon}>
							<TextInput
								value={password}
								onChangeText={setPassword}
								style={styles.formInput}
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
								<TouchableOpacity>
									<Ionicons name="magic-outline" size={20} color="#3b82f6" />
								</TouchableOpacity>
							</View>
						</View>
						{/* Strength Meter */}
						<View style={styles.strengthMeter}>
							<View style={[styles.strengthBar, styles.strengthBarFull]} />
							<View style={[styles.strengthBar, styles.strengthBarFull]} />
							<View style={[styles.strengthBar, styles.strengthBarFull]} />
							<View style={[styles.strengthBar, styles.strengthBarEmpty]} />
						</View>
					</View>
				</View>
			</View>

			{/* Actions */}
			<View style={styles.actionsContainer}>
				<TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
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
});
