import { useState, useEffect, createContext, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserInfoStore } from '@/store';
import { eventBus } from '@/utils';

type User = {
	token: string;
};

interface AuthContextValue {
	user: User | null;
	signIn: (userData: User) => Promise<void>;
	signOut: () => Promise<void>;
	isLoading: boolean;
	isReady: boolean;
}
const AuthContext = createContext<AuthContextValue>({
	user: null,
	signIn: () => Promise.resolve(),
	signOut: () => Promise.resolve(),
	isLoading: true,
	isReady: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
	const { fetchUserInfo } = useUserInfoStore();
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isReady, setIsReady] = useState(false);
	const checkAuthStatus = async () => {
		try {
			// 模拟网络延迟或实际检查
			const token = await AsyncStorage.getItem('token');
			if (token) {
				setUser({ token });
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
			// 确保至少有 500ms 的显示时间，避免闪烁
			setTimeout(() => setIsReady(true), 500);
		}
	};
	const signIn = async (userData: User) => {
		setUser(userData);
		await AsyncStorage.setItem('token', userData.token);
		await fetchUserInfo();
	};
	const signOut = async () => {
		setUser(null);
		await AsyncStorage.removeItem('token');
	};
	useEffect(() => {
		checkAuthStatus();
		const handleTokenExpired = async () => {
			await signOut();
		};
		eventBus.on('TOKEN_EXPIRED', handleTokenExpired);
		return () => {
			eventBus.off('TOKEN_EXPIRED', handleTokenExpired);
		};
	}, []);

	return (
		<AuthContext.Provider value={{ user, signIn, signOut, isLoading, isReady }}>{children}</AuthContext.Provider>
	);
}
export const useAuth: () => AuthContextValue = () => useContext(AuthContext);
