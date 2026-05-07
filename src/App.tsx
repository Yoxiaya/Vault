import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import AccountDetailsPage from './pages/AccountDetailsPage';
import EditAccountPage from './pages/EditAccountPage';
import MainTabs from './components/Footer';
import TestPage from './pages/TestPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProfileEditPage from './pages/ProfileEditPage';
import { useUserInfoStore } from './store';

export type EditAccountMode = 'add' | 'edit';

export type RootStackParamList = {
	VaultPage: undefined;
	AccountDetails: { id: string; mode: EditAccountMode };
	EditAccount: { id: string; mode: EditAccountMode };
	TestPage: { id: string; mode: EditAccountMode };
	LoginPage: undefined;
	SettingsPage: undefined;
	RegisterPage: undefined;
	ProfilePage: undefined;
	ProfileEditPage: undefined;
};
SplashScreen.preventAutoHideAsync();
const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
	const { user, isLoading, isReady } = useAuth();
	const { fetchUserInfo } = useUserInfoStore();

	useEffect(() => {
		fetchUserInfo();

		if (!isLoading && isReady) {
			SplashScreen.hideAsync();
		}
	}, [isLoading, isReady]);

	if (isLoading || !isReady) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}
	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: {
					backgroundColor: '#f9fafb',
				},
			}}
		>
			{!user ? (
				<>
					<Stack.Screen name="LoginPage" component={LoginPage} options={{ title: '登录' }} />
					<Stack.Screen name="RegisterPage" component={RegisterPage} options={{ title: '注册' }} />
				</>
			) : (
				<>
					<Stack.Screen name="VaultPage" component={MainTabs} options={{ headerShown: false }} />
					<Stack.Screen
						name="AccountDetails"
						component={AccountDetailsPage}
						options={{ title: '账户详情' }}
					/>
					<Stack.Screen name="EditAccount" component={EditAccountPage} options={{ title: '编辑账户' }} />
					<Stack.Screen name="TestPage" component={TestPage} options={{ title: '测试页面' }} />
					<Stack.Screen name="ProfilePage" component={ProfilePage} options={{ title: '个人中心' }} />
					<Stack.Screen name="ProfileEditPage" component={ProfileEditPage} />
				</>
			)}
		</Stack.Navigator>
	);
}
export default function App() {
	return (
		<AuthProvider>
			<NavigationContainer>
				<AppNavigator />
			</NavigationContainer>
		</AuthProvider>
	);
}
