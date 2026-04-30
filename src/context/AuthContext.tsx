import { useState, useEffect, createContext, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
	token: string;
};
const AuthContext = createContext({});

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	useEffect(() => {
		checkAuthStatus();
	}, []);
	const checkAuthStatus = async () => {
		try {
			const token = await AsyncStorage.getItem('token');
			if (token) {
				setUser({ token });
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};
	const singIn = async (userData: User) => {
		setUser(userData);
		await AsyncStorage.setItem('token', userData.token);
	};
	const signOut = async () => {
		setUser(null);
		await AsyncStorage.removeItem('token');
	};
	return <AuthContext.Provider value={{ user, singIn, signOut, isLoading }}>{children}</AuthContext.Provider>;
}
export const useAuth: any = () => useContext(AuthContext);
