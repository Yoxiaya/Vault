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
					<Text style={{ marginRight: 15, color: '#007AFF', fontSize: 16 }}>保存</Text>
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
					style={styles.input}
					value={profileName}
					onChangeText={setProfileName}
				/>
				<TouchableOpacity onPress={allClear}>
					<Ionicons name="close" size={20} color="#6693ecff" style={styles.icons} />
				</TouchableOpacity>
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f9fafb',
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	icons: {
		width: 20,
		height: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	input: {
		width: '85%',
		marginLeft: 16,
		marginRight: 12,
		marginVertical: 12,
		paddingVertical: 12,
		paddingHorizontal: 0,
		borderBottomWidth: 2,
		borderColor: '#6693ecff',
		borderRadius: 0,
	},
});
