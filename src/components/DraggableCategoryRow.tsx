import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SortableItem } from 'react-native-reanimated-dnd';
import { AccountCategory } from '../type';
import { categoryColorMap, categoryIconMap } from '../constants/category';
import { ThemeColors, useAppTheme } from '../theme';

const DELETE_ACTION_WIDTH = 84;

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		row: {
			height: 76,
			marginHorizontal: 16,
			borderRadius: 16,
			overflow: 'hidden',
			backgroundColor: colors.card,
		},
		item: {
			position: 'absolute',
			top: -1,
			left: -1,
			right: -1,
			height: 78,
			padding: 12,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			backgroundColor: colors.card,
			borderColor: colors.border,
			borderWidth: 1,
			borderRadius: 16,
		},
		activeItem: {
			backgroundColor: colors.surface,
			shadowColor: '#000000',
			shadowOffset: { width: 0, height: 6 },
			shadowOpacity: 0.18,
			shadowRadius: 10,
			elevation: 8,
		},
		deleteAction: {
			position: 'absolute',
			top: 0,
			right: 0,
			bottom: 0,
			width: DELETE_ACTION_WIDTH,
			backgroundColor: '#EF4444',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 3,
		},
		deleteText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
		content: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
		icon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
		info: { flex: 1, gap: 4 },
		name: { fontSize: 16, fontWeight: '600', color: colors.text },
		system: { fontSize: 11, color: colors.muted },
		dragHandle: { width: 38, height: 48, alignItems: 'center', justifyContent: 'center' },
	});

interface DraggableCategoryRowProps {
	category: AccountCategory;
	disabled: boolean;
	isActive: boolean;
	onEdit: () => void;
	onDelete: () => void;
}

export default function DraggableCategoryRow({
	category,
	disabled,
	isActive,
	onEdit,
	onDelete,
}: DraggableCategoryRowProps) {
	const { colors } = useAppTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const swipeX = useRef(new Animated.Value(0)).current;
	const swipeStartX = useRef(0);
	const isSwipeOpen = useRef(false);

	const settleSwipe = useCallback(
		(open: boolean) => {
			isSwipeOpen.current = open;
			Animated.spring(swipeX, {
				toValue: open ? -DELETE_ACTION_WIDTH : 0,
				damping: 24,
				stiffness: 220,
				useNativeDriver: true,
			}).start();
		},
		[swipeX]
	);

	const swipeResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => false,
				onMoveShouldSetPanResponder: (_, gesture) =>
					!disabled && Math.abs(gesture.dx) > 6 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
				onPanResponderGrant: () => {
					swipeX.stopAnimation((value) => {
						swipeStartX.current = value;
					});
				},
				onPanResponderMove: (_, gesture) => {
					const next = Math.max(-DELETE_ACTION_WIDTH, Math.min(0, swipeStartX.current + gesture.dx));
					swipeX.setValue(next);
				},
				onPanResponderRelease: (_, gesture) => {
					const projected = swipeStartX.current + gesture.dx + gesture.vx * 30;
					settleSwipe(projected < -DELETE_ACTION_WIDTH / 2);
				},
				onPanResponderTerminate: () => settleSwipe(isSwipeOpen.current),
			}),
		[disabled, settleSwipe, swipeX]
	);

	return (
		<View style={styles.row}>
			<TouchableOpacity
				style={styles.deleteAction}
				onPress={onDelete}
				disabled={disabled}
				accessibilityRole="button"
				accessibilityLabel={`删除${category.name}`}
			>
				<Ionicons name="trash-outline" size={21} color="#FFFFFF" />
				<Text style={styles.deleteText}>删除</Text>
			</TouchableOpacity>
			<Animated.View
				style={[styles.item, isActive && styles.activeItem, { transform: [{ translateX: swipeX }] }]}
				{...swipeResponder.panHandlers}
			>
				<TouchableOpacity
					style={styles.content}
					onPress={onEdit}
					disabled={disabled}
					accessibilityRole="button"
					accessibilityLabel={`编辑${category.name}`}
				>
					<View style={[styles.icon, { backgroundColor: `${categoryColorMap[category.color]}18` }]}>
						<Ionicons name={categoryIconMap[category.icon]} size={24} color={categoryColorMap[category.color]} />
					</View>
					<View style={styles.info}>
						<Text style={styles.name}>{category.name}</Text>
						{category.isSystem && <Text style={styles.system}>系统分类</Text>}
					</View>
				</TouchableOpacity>
				<SortableItem.Handle style={styles.dragHandle}>
					<View
						style={styles.dragHandle}
						accessibilityRole="adjustable"
						accessibilityLabel={`拖动${category.name}调整顺序`}
					>
						<Ionicons name="reorder-three-outline" size={26} color={colors.muted} />
					</View>
				</SortableItem.Handle>
			</Animated.View>
		</View>
	);
}
