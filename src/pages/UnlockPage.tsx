import React, { useState } from 'react';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useAccountsStore, useVaultStore } from '../store';
import { useToast } from '../components/Toast';
import { colors } from '../theme';

export default function UnlockPage() {
	const { signOut } = useAuth();
	const initializeWithPassword = useVaultStore((state) => state.initializeWithPassword);
	const initializing = useVaultStore((state) => state.initializing);
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const toast = useToast();

	const unlock = async () => {
		if (!password || initializing) return;
		try {
			await initializeWithPassword(password);
			useAccountsStore.getState().clearAccounts();
			setPassword('');
		} catch {
			toast.error('解锁失败', '主密码错误或密码库数据已损坏');
		}
	};

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
			<View style={styles.card}>
				<View style={styles.icon}>
					<Ionicons name="lock-closed" size={34} color={colors.primary} />
				</View>
				<Text style={styles.title}>解锁密码库</Text>
				<Text style={styles.subtitle}>输入主密码以在本机解密您的账号数据</Text>
				<View style={styles.inputRow}>
					<TextInput
						style={styles.input}
						value={password}
						onChangeText={setPassword}
						placeholder="主密码"
						placeholderTextColor="#98A2B3"
						secureTextEntry={!showPassword}
						autoCapitalize="none"
						onSubmitEditing={unlock}
					/>
					<TouchableOpacity style={styles.eye} onPress={() => setShowPassword((value) => !value)}>
						<Ionicons
							name={showPassword ? 'eye-off-outline' : 'eye-outline'}
							size={21}
							color={colors.muted}
						/>
					</TouchableOpacity>
				</View>
				<TouchableOpacity
					style={[styles.button, (!password || initializing) && styles.disabled]}
					onPress={unlock}
					disabled={!password || initializing}
				>
					{initializing ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>解锁</Text>}
				</TouchableOpacity>
				<TouchableOpacity style={styles.logout} onPress={signOut} disabled={initializing}>
					<Ionicons name="log-out-outline" size={18} color={colors.muted} />
					<Text style={styles.logoutText}>退出登录</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
	card: {
		backgroundColor: colors.surface,
		borderRadius: 20,
		padding: 24,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: 'center',
	},
	icon: {
		width: 68,
		height: 68,
		borderRadius: 20,
		backgroundColor: colors.primarySoft,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 18,
	},
	title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 8 },
	subtitle: { fontSize: 14, lineHeight: 20, textAlign: 'center', color: colors.muted, marginBottom: 24 },
	inputRow: { width: '100%', position: 'relative', marginBottom: 16 },
	input: {
		height: 52,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 13,
		paddingHorizontal: 16,
		paddingRight: 50,
		fontSize: 16,
		color: colors.text,
		backgroundColor: colors.background,
	},
	eye: {
		position: 'absolute',
		right: 4,
		top: 4,
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	button: {
		width: '100%',
		height: 52,
		borderRadius: 13,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	disabled: { opacity: 0.55 },
	buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
	logout: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, padding: 8 },
	logoutText: { color: colors.muted, fontSize: 14 },
});
