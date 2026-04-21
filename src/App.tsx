import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountDetailsPage from './pages/AccountDetailsPage';
import EditAccountPage from './pages/EditAccountPage';
import MainTabs from './components/Footer';
import TestPage from './pages/TestPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export type EditAccountMode = 'add' | 'edit';

export type RootStackParamList = {
	VaultPage: undefined;
	AccountDetails: { id: string; mode: EditAccountMode };
	EditAccount: { id: string; mode: EditAccountMode };
	TestPage: { id: string; mode: EditAccountMode };
	LoginPage: undefined;
	SettingsPage: undefined;
	RegisterPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={{
					headerStyle: {
						backgroundColor: '#f9fafb',
					},
				}}
			>
				<Stack.Screen name="VaultPage" component={MainTabs} options={{ headerShown: false }} />
				<Stack.Screen name="AccountDetails" component={AccountDetailsPage} options={{ title: '账户详情' }} />
				<Stack.Screen name="EditAccount" component={EditAccountPage} options={{ title: '编辑账户' }} />
				<Stack.Screen name="TestPage" component={TestPage} options={{ title: '测试页面' }} />
				<Stack.Screen name="LoginPage" component={LoginPage} options={{ title: '登录' }} />

				<Stack.Screen name="RegisterPage" component={RegisterPage} options={{ title: '注册' }} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}
