import { Ionicons } from '@expo/vector-icons';
import { useLayoutEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useUserInfoStore } from '../store';
import LoadingOverlay from '../components/LoadingOverlay';
import { RootStackParamList } from '../App';

type ProfileEditPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProfileEditPage'>;

export default function ProfileEditPage() {
	const navigation = useNavigation<ProfileEditPageNavigationProp>();
	const [profileName, setProfileName] = useState('');
	const { updateUserInfo, loading } = useUserInfoStore();

	const saveNickname = async () => {
		if (!profileName) {
			return;
		}
		await updateUserInfo({ profileName });

		navigation.goBack();
	};
	const allClear = () => {
		setProfileName('');
	};

	useLayoutEffect(() => {
		navigation.setOptions({
			title: '修改昵称',
			headerRight: () => (
				<TouchableOpacity onPress={saveNickname}>
					<Text style={{ marginRight: 15, color: '#3b82f6', fontSize: 16 }}>保存</Text>
				</TouchableOpacity>
			),
		});
	}, [navigation, profileName]);

	return (
		<View style={styles.container}>
			<LoadingOverlay visible={loading} loadingText="正在更新..." />
			<View style={styles.inputContainer}>
				<TextInput
					placeholder="请输入新昵称"
					placeholderTextColor="#9ca3af"
					style={styles.input}
					value={profileName}
					onChangeText={setProfileName}
				/>
				{profileName.length > 0 && (
					<TouchableOpacity onPress={allClear}>
						<Ionicons name="close-circle" size={18} color="#9ca3af" />
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		marginTop: 16,
	},
	input: {
		flex: 1,
		height: 48,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		backgroundColor: '#f9fafb',
		paddingHorizontal: 16,
		fontSize: 16,
		color: '#1f2937',
	},
});
