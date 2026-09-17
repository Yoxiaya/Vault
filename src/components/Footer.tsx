import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import VaultPage from '../pages/VaultPage';
import GeneratorPage from '../pages/GeneratorPage';
import HealthPage from '../pages/HealthPage';
import SettingsPage from '../pages/SettingsPage';
import AppHeader from './AppHeader';

export type MainTabParamList = {
	Vault: undefined;
	Generator: undefined;
	Health: undefined;
	Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function getTabIcon(routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap {
	if (routeName === 'Vault') return focused ? 'lock-closed' : 'lock-closed-outline';
	if (routeName === 'Generator') return focused ? 'key' : 'key-outline';
	if (routeName === 'Health') return focused ? 'pulse' : 'pulse-outline';
	return focused ? 'settings' : 'settings-outline';
}

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	const insets = useSafeAreaInsets();
	const { colors } = useAppTheme();
	const [barWidth, setBarWidth] = useState(0);
	const indicatorX = useRef(new Animated.Value(0)).current;
	const itemWidth = barWidth / state.routes.length;

	useEffect(() => {
		if (!barWidth) return;
		Animated.spring(indicatorX, {
			toValue: state.index * itemWidth + (itemWidth - 22) / 2,
			damping: 18,
			stiffness: 180,
			mass: 0.7,
			useNativeDriver: true,
		}).start();
	}, [barWidth, indicatorX, itemWidth, state.index]);

	const onLayout = (event: LayoutChangeEvent) => setBarWidth(event.nativeEvent.layout.width);

	return (
		<View
			onLayout={onLayout}
			style={[
				styles.tabBar,
				{
					bottom: Math.max(insets.bottom, 10),
					backgroundColor: colors.surface,
					borderColor: colors.border,
				},
			]}
		>
			{state.routes.map((route, index) => {
				const focused = state.index === index;
				const options = descriptors[route.key].options;
				const label =
					typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title || route.name;
				const color = focused ? colors.primary : colors.muted;

				return (
					<Pressable
						key={route.key}
						accessibilityRole="button"
						accessibilityState={focused ? { selected: true } : {}}
						onPress={() => {
							const event = navigation.emit({
								type: 'tabPress',
								target: route.key,
								canPreventDefault: true,
							});
							if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
						}}
						onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
						style={styles.tabItem}
					>
						<Ionicons name={getTabIcon(route.name, focused)} size={21} color={color} />
						<Text style={[styles.tabLabel, { color }]}>{label}</Text>
					</Pressable>
				);
			})}
			{barWidth > 0 && (
				<Animated.View
					pointerEvents="none"
					style={[
						styles.activeIndicator,
						{ backgroundColor: colors.primary, transform: [{ translateX: indicatorX }] },
					]}
				/>
			)}
		</View>
	);
}

function MainTabs() {
	const { colors: themeColors } = useAppTheme();
	return (
		<Tab.Navigator
			tabBar={(props) => <FloatingTabBar {...props} />}
			screenOptions={{
				tabBarHideOnKeyboard: true,
				sceneStyle: {
					backgroundColor: themeColors.page,
				},
				header: () => <AppHeader />,
			}}
		>
			<Tab.Screen name="Vault" component={VaultPage} options={{ title: '保险库', headerShown: false }} />
			<Tab.Screen name="Generator" component={GeneratorPage} options={{ title: '生成器' }} />
			<Tab.Screen name="Health" component={HealthPage} options={{ title: '安全' }} />
			<Tab.Screen name="Settings" component={SettingsPage} options={{ title: '设置' }} />
		</Tab.Navigator>
	);
}
const styles = StyleSheet.create({
	tabBar: {
		position: 'absolute',
		left: 14,
		right: 14,
		height: 70,
		flexDirection: 'row',
		borderWidth: 1,
		borderRadius: 24,
		shadowColor: '#334155',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.13,
		shadowRadius: 18,
		elevation: 10,
		overflow: 'hidden',
	},
	tabItem: {
		flex: 1,
		height: 69,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 3,
		paddingBottom: 3,
	},
	tabLabel: { fontSize: 11, fontWeight: '600' },
	activeIndicator: {
		position: 'absolute',
		left: 0,
		bottom: 5,
		width: 22,
		height: 3,
		borderRadius: 2,
	},
});
export default MainTabs;
