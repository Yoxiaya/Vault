import { useState, useEffect, createContext, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserInfoStore } from '@/store';
import { eventBus, EventName, isTokenExpired, extractUserFromJwt } from '@/utils';

type User = {
	/** 原始 JWT token（三段格式） */
	token: string;
	/** 从 JWT sub 字段提取的用户 ID */
	userId: string;
	/** 从 JWT payload 提取的用户名 */
	username?: string;
	/** 从 JWT payload 提取的邮箱 */
	email?: string;
};

/** signIn 入参 — 只需传入 token 字符串，内部自动解码 */
type SignInData = {
	token: string;
};

interface AuthContextValue {
	user: User | null;
	signIn: (userData: SignInData) => Promise<void>;
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
			const token = await AsyncStorage.getItem('token');
			if (token) {
				// 检查 JWT 是否已过期
				if (isTokenExpired(token)) {
					await AsyncStorage.removeItem('token');
					setUser(null);
				} else {
					// 从 JWT 中解码用户信息
					const jwtUser = extractUserFromJwt(token);
					setUser({
						token,
						userId: jwtUser?.userId || '',
						username: jwtUser?.username,
						email: jwtUser?.email,
					});
				}
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
			// 确保至少有 500ms 的显示时间，避免闪烁
			setTimeout(() => setIsReady(true), 500);
		}
	};

	const signIn = async (userData: SignInData) => {
		// 从 JWT 中解码用户信息
		const jwtUser = extractUserFromJwt(userData.token);
		const fullUser: User = {
			token: userData.token,
			userId: jwtUser?.userId || '',
			username: jwtUser?.username,
			email: jwtUser?.email,
		};
		setUser(fullUser);
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
		eventBus.on(EventName.TOKEN_EXPIRED, handleTokenExpired);
		return () => {
			eventBus.off(EventName.TOKEN_EXPIRED, handleTokenExpired);
		};
	}, []);

	return (
		<AuthContext.Provider value={{ user, signIn, signOut, isLoading, isReady }}>{children}</AuthContext.Provider>
	);
}
export const useAuth: () => AuthContextValue = () => useContext(AuthContext);
