import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import VaultPage from '../pages/VaultPage';
import GeneratorPage from '../pages/GeneratorPage';
import HealthPage from '../pages/HealthPage';
import SettingsPage from '../pages/SettingsPage';

export type MainTabParamList = {
	Vault: undefined;
	Generator: undefined;
	Health: undefined;
	Settings: undefined;
};

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
				headerTitle: () => {
					return (
						<View style={styles.headerTitle}>
							<Ionicons name="shield" size={28} color="#1D4ED7" />
							<Text style={styles.headerTitleText}>Vault</Text>
						</View>
					);
				},
			})}
		>
			<Tab.Screen name="Vault" component={VaultPage} options={{ title: '保险库' }} />
			<Tab.Screen name="Generator" component={GeneratorPage} options={{ title: '生成器' }} />
			<Tab.Screen name="Health" component={HealthPage} options={{ title: '健康状况' }} />
			<Tab.Screen name="Settings" component={SettingsPage} options={{ title: '设置' }} />
			{/* <Tab.Screen name="TestPage" component={TestPage} options={{ title: '测试页面' }} /> */}
		</Tab.Navigator>
	);
}
const styles = StyleSheet.create({
	headerTitle: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	headerTitleText: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#1D4ED7',
	},
});

export default MainTabs;
