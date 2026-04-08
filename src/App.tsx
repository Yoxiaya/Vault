import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import VaultPage from './pages/VaultPage';
import AccountDetailsPage from './pages/AccountDetailsPage';
import EditAccountPage from './pages/EditAccountPage';
import GeneratorPage from './pages/GeneratorPage';
import HealthPage from './pages/HealthPage';
import SettingsPage from './pages/SettingsPage';

export type RootStackParamList = {
	Main: undefined;
	AccountDetails: { id: string };
	EditAccount: { id: string };
};

export type MainTabParamList = {
	Vault: undefined;
	Generator: undefined;
	Health: undefined;
	Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => {
					let iconName: keyof typeof Ionicons.glyphMap = 'lock-closed';

					if (route.name === 'Vault') {
						iconName = focused ? 'lock-closed' : 'lock-closed-outline';
					} else if (route.name === 'Generator') {
						iconName = focused ? 'key' : 'key-outline';
					} else if (route.name === 'Health') {
						iconName = focused ? 'pulse' : 'pulse-outline';
					} else if (route.name === 'Settings') {
						iconName = focused ? 'settings' : 'settings-outline';
					}

					return <Ionicons name={iconName} size={size} color={color} />;
				},
				tabBarActiveTintColor: '#3b82f6',
				tabBarInactiveTintColor: 'gray',
				headerStyle: {
					backgroundColor: '#f9fafb',
					borderBottomWidth: 1,
					borderBottomColor: '#e5e7eb',
				},
				headerTitle: 'Vault',
			})}
		>
			<Tab.Screen name="Vault" component={VaultPage} options={{ title: '保险库' }} />
			<Tab.Screen name="Generator" component={GeneratorPage} options={{ title: '生成器' }} />
			<Tab.Screen name="Health" component={HealthPage} options={{ title: '健康状况' }} />
			<Tab.Screen name="Settings" component={SettingsPage} options={{ title: '设置' }} />
		</Tab.Navigator>
	);
}

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={{
					headerStyle: {
						backgroundColor: '#f9fafb',
						// @ts-ignore
						borderBottomWidth: 1,
						borderBottomColor: '#e5e7eb',
					},
				}}
			>
				<Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
				<Stack.Screen name="AccountDetails" component={AccountDetailsPage} options={{ title: '账户详情' }} />
				<Stack.Screen name="EditAccount" component={EditAccountPage} options={{ title: '编辑账户' }} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}
