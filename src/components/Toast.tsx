import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity, Dimensions, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eventBus, ToastEvent, EventName } from '@/utils';

// iOS 状态栏固定约 47pt（刘海屏）/ 20pt（非刘海），取个靠谱的中间值
const TOP_OFFSET = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 8;

// ── Types ──────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
	id: string;
	type: ToastType;
	title: string;
	message?: string;
}

interface ToastContextValue {
	success: (title: string, message?: string) => void;
	error: (title: string, message?: string) => void;
	warning: (title: string, message?: string) => void;
	info: (title: string, message?: string) => void;
}

// ── Config ─────────────────────────────────────────────

const TOAST_CONFIG: Record<
	ToastType,
	{
		icon: keyof typeof Ionicons.glyphMap;
		bg: string;
		border: string;
		iconColor: string;
		titleColor: string;
		msgColor: string;
	}
> = {
	success: {
		icon: 'checkmark-circle',
		bg: '#f0fdf4',
		border: '#bbf7d0',
		iconColor: '#16a34a',
		titleColor: '#15803d',
		msgColor: '#166534',
	},
	error: {
		icon: 'close-circle',
		bg: '#fef2f2',
		border: '#fecaca',
		iconColor: '#dc2626',
		titleColor: '#b91c1c',
		msgColor: '#991b1b',
	},
	warning: {
		icon: 'warning',
		bg: '#fffbeb',
		border: '#fde68a',
		iconColor: '#d97706',
		titleColor: '#b45309',
		msgColor: '#92400e',
	},
	info: {
		icon: 'information-circle',
		bg: '#eff6ff',
		border: '#bfdbfe',
		iconColor: '#2563eb',
		titleColor: '#1d4ed8',
		msgColor: '#1e40af',
	},
};

const DURATION = 2800;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOAST_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);

// ── Context ────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({
	success: () => {},
	error: () => {},
	warning: () => {},
	info: () => {},
});

export const useToast = () => useContext(ToastContext);

// ── Single Toast Row ───────────────────────────────────

function ToastRow({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(-80)).current;
	const dismissed = useRef(false);

	React.useEffect(() => {
		// 入场动画
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}),
			Animated.spring(slideAnim, {
				toValue: 0,
				damping: 15,
				stiffness: 150,
				useNativeDriver: true,
			}),
		]).start();

		// 自动消失
		const timer = setTimeout(() => dismiss(), DURATION);
		return () => clearTimeout(timer);
	}, []);

	const dismiss = () => {
		if (dismissed.current) return;
		dismissed.current = true;
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 250,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: -60,
				duration: 250,
				useNativeDriver: true,
			}),
		]).start(() => onDismiss(item.id));
	};

	const config = TOAST_CONFIG[item.type];

	return (
		<Animated.View
			style={[
				styles.toastRow,
				{
					backgroundColor: config.bg,
					borderColor: config.border,
					opacity: fadeAnim,
					transform: [{ translateY: slideAnim }],
				},
			]}
		>
			<TouchableOpacity style={styles.toastContent} activeOpacity={0.9} onPress={dismiss}>
				<Ionicons name={config.icon} size={22} color={config.iconColor} style={styles.toastIcon} />
				<View style={styles.toastTextArea}>
					<Text style={[styles.toastTitle, { color: config.titleColor }]}>{item.title}</Text>
					{item.message ? (
						<Text style={[styles.toastMessage, { color: config.msgColor }]}>{item.message}</Text>
					) : null}
				</View>
				<TouchableOpacity style={styles.closeBtn} onPress={dismiss}>
					<Ionicons name="close" size={18} color={config.iconColor} />
				</TouchableOpacity>
			</TouchableOpacity>
		</Animated.View>
	);
}

// ── Provider ───────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const counterRef = useRef(0);

	const addToast = useCallback((type: ToastType, title: string, message?: string) => {
		const id = `${Date.now()}_${++counterRef.current}`;
		setToasts((prev) => [...prev, { id, type, title, message }]);
	}, []);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	// 监听 eventBus，让非 React 代码（如 service 层）也能触发 Toast
	useEffect(() => {
		const handler = (payload: ToastEvent) => {
			addToast(payload.type, payload.title, payload.message);
		};
		eventBus.on(EventName.SHOW_TOAST, handler);
		return () => eventBus.off(EventName.SHOW_TOAST, handler);
	}, [addToast]);

	const contextValue: ToastContextValue = {
		success: (title, message) => addToast('success', title, message),
		error: (title, message) => addToast('error', title, message),
		warning: (title, message) => addToast('warning', title, message),
		info: (title, message) => addToast('info', title, message),
	};

	return (
		<ToastContext.Provider value={contextValue}>
			{children}

			{/* Toast 容器 — 绝对定位在顶部安全区下方 */}
			<View style={[styles.toastContainer, { top: TOP_OFFSET }]} pointerEvents="box-none">
				{toasts.map((item) => (
					<ToastRow key={item.id} item={item} onDismiss={removeToast} />
				))}
			</View>
		</ToastContext.Provider>
	);
}

// ── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
	toastContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		alignItems: 'center',
		zIndex: 9999,
		gap: 10,
	},
	toastRow: {
		width: TOAST_WIDTH,
		borderRadius: 14,
		borderWidth: 1,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 6,
		overflow: 'hidden',
	},
	toastContent: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		paddingVertical: 14,
		paddingLeft: 16,
		paddingRight: 10,
	},
	toastIcon: {
		marginTop: 1,
		marginRight: 12,
	},
	toastTextArea: {
		flex: 1,
		justifyContent: 'center',
	},
	toastTitle: {
		fontSize: 15,
		fontWeight: '600',
		lineHeight: 20,
	},
	toastMessage: {
		fontSize: 13,
		fontWeight: '400',
		marginTop: 3,
		lineHeight: 18,
	},
	closeBtn: {
		padding: 6,
		marginLeft: 4,
		alignSelf: 'flex-start',
	},
});
