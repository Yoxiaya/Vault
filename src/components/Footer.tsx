import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
	const insets = useSafeAreaInsets();
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
					return (
						<View style={[styles.tabIcon, focused && styles.tabIconActive]}>
							<Ionicons name={iconName} size={22} color={color} />
						</View>
					);
				},
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.muted,
				tabBarStyle: {
					height: 64 + Math.max(insets.bottom, 8),
					paddingBottom: Math.max(insets.bottom, 8),
					paddingTop: 6,
					backgroundColor: colors.surface,
					borderTopColor: colors.border,
					elevation: 0,
				},
				tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
				headerStyle: { backgroundColor: colors.background },
				headerShadowVisible: false,
				headerTitleAlign: 'left',
				headerTintColor: colors.text,
				headerTitle: () => (
					<View style={styles.brand} accessibilityLabel="Vault">
						<Image
							source={require('../../assets/vault-mark.svg')}
							style={styles.logo}
							contentFit="contain"
						/>
						<Text style={styles.brandName}>Vault</Text>
					</View>
				),
			})}
		>
			<Tab.Screen name="Vault" component={VaultPage} options={{ title: '保险库' }} />
			<Tab.Screen name="Generator" component={GeneratorPage} options={{ title: '生成器' }} />
			<Tab.Screen name="Health" component={HealthPage} options={{ title: '安全' }} />
			<Tab.Screen name="Settings" component={SettingsPage} options={{ title: '设置' }} />
		</Tab.Navigator>
	);
}
const styles = StyleSheet.create({
	brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	logo: { width: 36, height: 36 },
	brandName: { fontSize: 24, fontWeight: '700', color: colors.brand },
	tabIcon: { width: 52, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
	tabIconActive: { backgroundColor: colors.primarySoft },
});
export default MainTabs;
