import { Ionicons } from '@expo/vector-icons';
import { useLayoutEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useUserInfoStore } from '../store';
import LoadingOverlay from '../components/LoadingOverlay';
import { RootStackParamList } from '../App';
import { ThemeColors, useAppTheme } from '../theme';

type ProfileEditPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProfileEditPage'>;

export default function ProfileEditPage() {
	const navigation = useNavigation<ProfileEditPageNavigationProp>();
	const [profileName, setProfileName] = useState('');
	const { updateUserInfo, loading } = useUserInfoStore();
	const { colors } = useAppTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);

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
					<Text style={{ marginRight: 15, color: colors.primary, fontSize: 16 }}>保存</Text>
				</TouchableOpacity>
			),
		});
	}, [colors.primary, navigation, profileName]);

	return (
		<View style={styles.container}>
			<LoadingOverlay visible={loading} loadingText="正在更新..." />
			<View style={styles.inputContainer}>
				<TextInput
					placeholder="请输入新昵称"
					placeholderTextColor={colors.muted}
					style={styles.input}
					value={profileName}
					onChangeText={setProfileName}
				/>
				{profileName.length > 0 && (
					<TouchableOpacity onPress={allClear}>
						<Ionicons name="close-circle" size={18} color={colors.muted} />
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
}
const createStyles = (colors: ThemeColors) => StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.page,
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
		borderColor: colors.border,
		backgroundColor: colors.surface,
		paddingHorizontal: 16,
		fontSize: 16,
		color: colors.text,
	},
});
