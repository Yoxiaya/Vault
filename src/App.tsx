import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountDetailsPage from './pages/AccountDetailsPage';
import EditAccountPage from './pages/EditAccountPage';
import MainTabs from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProfileEditPage from './pages/ProfileEditPage';

export type RootStackParamList = {
	VaultPage: undefined;
	AccountDetails: { id: string; mode: 'add' | 'edit' };
	EditAccount: { id: string; mode: 'add' | 'edit' };
	LoginPage: undefined;
	SettingsPage: undefined;
	RegisterPage: undefined;
	ProfilePage: undefined;
	ProfileEditPage: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
	const { user, isLoading, isReady } = useAuth();

	if (isLoading || !isReady) {
		return <View style={{ flex: 1, backgroundColor: '#ffffff' }} />;
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
					<Stack.Screen name="LoginPage" component={LoginPage} options={{ headerShown: false }} />
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
				<ToastProvider>
					<AppNavigator />
				</ToastProvider>
			</NavigationContainer>
		</AuthProvider>
	);
}
