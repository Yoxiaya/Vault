import React, { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import { useFonts, ZCOOLKuaiLe_400Regular } from '@expo-google-fonts/zcool-kuaile';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
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
import CategoryManagementPage from './pages/CategoryManagementPage';
import CategoryEditPage from './pages/CategoryEditPage';
import ThemeSettingsPage from './pages/ThemeSettingsPage';
import UnlockPage from './pages/UnlockPage';
import { useThemeStore, useVaultStore } from './store';
import { useAppTheme } from './theme';

export type RootStackParamList = {
	VaultPage: undefined;
	AccountDetails: { id: string | number; mode: 'add' | 'edit' };
	EditAccount: { id: string | number; mode: 'add' | 'edit' };
	LoginPage: undefined;
	SettingsPage: undefined;
	RegisterPage: undefined;
	UnlockPage: undefined;
	ProfilePage: undefined;
	ProfileEditPage: undefined;
	CategoryManagementPage: undefined;
	CategoryEditPage: { id?: string } | undefined;
	ThemeSettingsPage: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
	const { user, isLoading, isReady } = useAuth();
	const isUnlocked = useVaultStore((state) => state.dek !== null);
	const { colors } = useAppTheme();

	if (isLoading || !isReady) {
		return <View style={{ flex: 1, backgroundColor: colors.page }} />;
	}
	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: {
					backgroundColor: colors.surface,
				},
				headerTintColor: colors.primary,
				headerTitleStyle: {
					color: colors.primary,
					fontWeight: '700',
				},
				headerShadowVisible: true,
				contentStyle: {
					backgroundColor: colors.page,
				},
			}}
		>
			{!user ? (
				<>
					<Stack.Screen name="LoginPage" component={LoginPage} options={{ headerShown: false }} />
					<Stack.Screen name="RegisterPage" component={RegisterPage} options={{ title: '注册' }} />
				</>
			) : !isUnlocked ? (
				<Stack.Screen name="UnlockPage" component={UnlockPage} options={{ headerShown: false }} />
			) : (
				<>
					<Stack.Screen name="VaultPage" component={MainTabs} options={{ headerShown: false }} />
					<Stack.Screen
						name="AccountDetails"
						component={AccountDetailsPage}
						options={{ title: '账户详情' }}
					/>
					<Stack.Screen
						name="EditAccount"
						component={EditAccountPage}
						options={({ route }) => ({ title: route.params.mode === 'add' ? '新增账户' : '编辑账户' })}
					/>
					<Stack.Screen name="ProfilePage" component={ProfilePage} options={{ title: '个人中心' }} />
					<Stack.Screen name="ProfileEditPage" component={ProfileEditPage} />
					<Stack.Screen name="CategoryManagementPage" component={CategoryManagementPage} />
					<Stack.Screen name="CategoryEditPage" component={CategoryEditPage} />
					<Stack.Screen name="ThemeSettingsPage" component={ThemeSettingsPage} options={{ title: '主题设置' }} />
				</>
			)}
		</Stack.Navigator>
	);
}
export default function App() {
	const [fontsLoaded, fontError] = useFonts({ ZCOOLKuaiLe_400Regular });
	const hydrateTheme = useThemeStore((state) => state.hydrate);
	const themeHydrated = useThemeStore((state) => state.hydrated);
	const { colors: themeColors, isDark } = useAppTheme();

	useEffect(() => {
		void hydrateTheme();
	}, [hydrateTheme]);

	if ((!fontsLoaded && !fontError) || !themeHydrated) {
		return <View style={{ flex: 1, backgroundColor: themeColors.background }} />;
	}

	return (
		<AuthProvider>
			<StatusBar
				barStyle={isDark ? 'light-content' : 'dark-content'}
				backgroundColor={themeColors.surface}
				translucent={false}
			/>
			<NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
				<ToastProvider>
					<AppNavigator />
				</ToastProvider>
			</NavigationContainer>
		</AuthProvider>
	);
}
