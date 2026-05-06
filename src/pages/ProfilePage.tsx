import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';
import { deleteImage, uploadImage } from '../service/api';
import LoadingOverlay from '../components/LoadingOverlay';

type ProfilePageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProfilePage'>;

export default function ProfilePage() {
	const navigation = useNavigation<ProfilePageNavigationProp>();
	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState({
		name: 'Alex Designer',
		email: 'alex.design@vault.com',
		phone: '+86 138 **** 8888',
		avatar: 'https://pic1.imgdb.cn/item/69e19be31e8dab8252386987.jpg',
	});

	const [securityInfo, setSecurityInfo] = useState({
		loginHistory: '10分钟前',
		trustedDevices: '3 台',
		twoFactorEnabled: true,
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

	const updateAvatar = async () => {
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
		if (result.canceled) return;
		setIsLoading(true);
		try {
			const imageUrl = await uploadImageToServer(result.assets[0]);
			setUser({ ...user, avatar: imageUrl });
			await deleteImage({ url: user.avatar });
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	const renderMenuRow = (title: string, value?: string, onPress?: () => void) => (
		<TouchableOpacity style={styles.menuRow} activeOpacity={0.7} onPress={onPress}>
			<Text style={styles.menuTitle}>{title}</Text>
			<View style={styles.menuRowRight}>
				{value && title !== '头像' ? <Text style={styles.menuValue}>{value}</Text> : null}
				{title === '头像' ? <Image source={{ uri: value }} style={styles.avatar} /> : null}

				<Ionicons name="chevron-forward" size={20} color="#9ca3af" />
			</View>
		</TouchableOpacity>
	);

	return (
		<View style={[styles.container]}>
			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				<View style={styles.content}>
					{/* Basic Information Card */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>基本信息</Text>
						<View style={styles.card}>
							{renderMenuRow('头像', user.avatar, updateAvatar)}
							{renderMenuRow('昵称', user.name)}
							{renderMenuRow('电子邮箱', user.email)}
							{renderMenuRow('手机号码', user.phone)}
						</View>
					</View>

					{/* Account Security Card */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>账户安全</Text>
						<View style={styles.card}>
							{renderMenuRow('登录历史', securityInfo.loginHistory)}
							{renderMenuRow('受信任设备', securityInfo.trustedDevices)}
							<TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
								<View style={styles.menuRowWithIcon}>
									<Ionicons name="shield-checkmark" size={20} color="#6b7280" />
									<Text style={styles.menuTitle}>双重身份验证</Text>
								</View>
								<View style={styles.menuRowRight}>
									<View style={styles.twoFactorStatus}>
										<View style={styles.statusDot} />
										<Text style={styles.statusText}>已开启</Text>
									</View>
									<Ionicons name="chevron-forward" size={20} color="#9ca3af" />
								</View>
							</TouchableOpacity>
						</View>
					</View>
				</View>
				<LoadingOverlay visible={isLoading} loadingText="正在更新..." />
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f9fafb',
	},

	scrollView: {
		flex: 1,
	},
	content: {
		padding: 16,
	},

	avatar: {
		width: 60,
		height: 60,
		borderRadius: 50,
		borderWidth: 0,
	},

	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#6b7280',
		textTransform: 'uppercase',
		letterSpacing: 1,
		marginBottom: 12,
		paddingLeft: 8,
	},
	card: {
		backgroundColor: 'white',
		borderRadius: 12,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	menuRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#f3f4f6',
	},
	menuRowWithIcon: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	menuTitle: {
		fontSize: 16,
		fontWeight: '500',
		color: '#1f2937',
		marginLeft: 12,
	},
	menuRowRight: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	menuValue: {
		fontSize: 14,
		color: '#6b7280',
		marginRight: 8,
	},
	twoFactorStatus: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 8,
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#3b82f6',
		marginRight: 6,
	},
	statusText: {
		fontSize: 14,
		color: '#3b82f6',
		fontWeight: '500',
	},
});
