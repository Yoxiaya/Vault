import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Animated,
	Modal,
	PanResponder,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { useAccountsStore, useCategoriesStore } from '../store';
import { AccountCategory } from '../type';
import { categoryColorMap, categoryIconMap } from '../constants/category';
import { useToast } from '../components/Toast';
import { cardStyles, colors } from '../theme';

type PageNavigation = NativeStackNavigationProp<RootStackParamList, 'CategoryManagementPage'>;

const ROW_STEP = 88;

function DraggableCategoryRow({
	category,
	index,
	count,
	disabled,
	onDrop,
	onDragStateChange,
	onEdit,
	onDelete,
}: {
	category: AccountCategory;
	index: number;
	count: number;
	disabled: boolean;
	onDrop: (from: number, to: number) => void;
	onDragStateChange: (dragging: boolean) => void;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const translateY = useRef(new Animated.Value(0)).current;
	const [dragging, setDragging] = useState(false);
	const responder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => !disabled,
				onMoveShouldSetPanResponder: (_, gesture) => !disabled && Math.abs(gesture.dy) > 2,
				onPanResponderGrant: () => {
					setDragging(true);
					onDragStateChange(true);
				},
				onPanResponderMove: (_, gesture) => {
					const min = -index * ROW_STEP;
					const max = (count - index - 1) * ROW_STEP;
					translateY.setValue(Math.max(min, Math.min(max, gesture.dy)));
				},
				onPanResponderRelease: (_, gesture) => {
					const min = -index * ROW_STEP;
					const max = (count - index - 1) * ROW_STEP;
					const offset = Math.max(min, Math.min(max, gesture.dy));
					const target = Math.max(0, Math.min(count - 1, index + Math.round(offset / ROW_STEP)));
					Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
					setDragging(false);
					onDragStateChange(false);
					if (target !== index) onDrop(index, target);
				},
				onPanResponderTerminate: () => {
					Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
					setDragging(false);
					onDragStateChange(false);
				},
			}),
		[disabled, index, count, onDrop, onDragStateChange, translateY]
	);

	return (
		<Animated.View
			style={[
				styles.item,
				dragging && styles.draggingItem,
				{ transform: [{ translateY }], zIndex: dragging ? 10 : 0 },
			]}
		>
			<View style={[styles.icon, { backgroundColor: `${categoryColorMap[category.color]}18` }]}>
				<Ionicons name={categoryIconMap[category.icon]} size={24} color={categoryColorMap[category.color]} />
			</View>
			<View style={styles.info}>
				<Text style={styles.name}>{category.name}</Text>
				{category.isSystem && <Text style={styles.system}>系统分类</Text>}
			</View>
			<View style={styles.actions}>
				<TouchableOpacity style={styles.action} onPress={onEdit} disabled={disabled}>
					<Ionicons name="create-outline" size={19} color={colors.primary} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.action} onPress={onDelete} disabled={disabled}>
					<Ionicons name="trash-outline" size={19} color="#EF4444" />
				</TouchableOpacity>
				<View
					style={styles.dragHandle}
					accessibilityRole="adjustable"
					accessibilityLabel={`拖动${category.name}调整顺序`}
					{...responder.panHandlers}
				>
					<Ionicons name="reorder-three-outline" size={26} color={colors.muted} />
				</View>
			</View>
		</Animated.View>
	);
}

export default function CategoryManagementPage() {
	const navigation = useNavigation<PageNavigation>();
	const toast = useToast();
	const { categories, loading, fetchCategories, reorderCategories, deleteCategory } = useCategoriesStore();
	const { fetchAccounts } = useAccountsStore();
	const [deleting, setDeleting] = useState<AccountCategory | null>(null);
	const [moveTo, setMoveTo] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [dragging, setDragging] = useState(false);
	const [displayCategories, setDisplayCategories] = useState<AccountCategory[]>(categories);

	useLayoutEffect(() => {
		navigation.setOptions({
			title: '账号分类',
			headerRight: () => (
				<TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('CategoryEditPage')}>
					<Ionicons name="add" size={20} color={colors.primary} />
					<Text style={styles.headerButtonText}>添加</Text>
				</TouchableOpacity>
			),
		});
	}, [navigation]);

	useEffect(() => {
		fetchCategories().catch(() => toast.error('加载失败', '无法获取账号分类'));
	}, []);

	useEffect(() => {
		setDisplayCategories(categories);
	}, [categories]);

	const move = async (from: number, to: number) => {
		if (from === to || busy) return;
		const next = [...displayCategories];
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		setDisplayCategories(next);
		setBusy(true);
		try {
			await reorderCategories(next.map((item) => item.id));
		} catch (error) {
			setDisplayCategories(categories);
			toast.error('排序失败', error instanceof Error ? error.message : '请稍后重试');
		} finally {
			setBusy(false);
		}
	};

	const confirmDelete = async () => {
		if (!deleting || busy) return;
		setBusy(true);
		try {
			const count = await deleteCategory(deleting.id, moveTo);
			await fetchAccounts();
			toast.success('分类已删除', count ? `${count} 个账户已完成迁移` : '该分类下没有账户');
			setDeleting(null);
			setMoveTo(null);
		} catch (error) {
			toast.error('删除失败', error instanceof Error ? error.message : '请稍后重试');
		} finally {
			setBusy(false);
		}
	};

	return (
		<View style={styles.container}>
			{loading && categories.length === 0 ? (
				<ActivityIndicator style={styles.loader} color={colors.primary} />
			) : (
				<ScrollView contentContainerStyle={styles.content} scrollEnabled={!dragging}>
					<Text style={styles.hint}>按住右侧拖拽手柄调整顺序，松手后自动保存。</Text>
					{displayCategories.map((category, index) => (
						<DraggableCategoryRow
							key={category.id}
							category={category}
							index={index}
							count={displayCategories.length}
							disabled={busy}
							onDrop={move}
							onDragStateChange={setDragging}
							onEdit={() => navigation.navigate('CategoryEditPage', { id: category.id })}
							onDelete={() => {
								setDeleting(category);
								setMoveTo(null);
							}}
						/>
					))}
				</ScrollView>
			)}

			<Modal visible={!!deleting} transparent animationType="fade" onRequestClose={() => setDeleting(null)}>
				<View style={styles.modalRoot}>
					<Pressable style={StyleSheet.absoluteFill} onPress={() => !busy && setDeleting(null)} />
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>删除“{deleting?.name}”</Text>
						<Text style={styles.modalDescription}>请选择该分类下账户的迁移位置：</Text>
						<ScrollView style={styles.targets}>
							{[
								{ id: null, name: '未分类' },
								...categories
									.filter((item) => item.id !== deleting?.id)
									.map((item) => ({ id: item.id, name: item.name })),
							].map((target) => (
								<TouchableOpacity
									key={target.id || 'none'}
									style={[styles.target, moveTo === target.id && styles.targetActive]}
									onPress={() => setMoveTo(target.id)}
								>
									<Ionicons
										name={moveTo === target.id ? 'radio-button-on' : 'radio-button-off'}
										size={20}
										color={moveTo === target.id ? colors.primary : colors.muted}
									/>
									<Text style={styles.targetText}>{target.name}</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
						<View style={styles.modalActions}>
							<TouchableOpacity
								style={styles.cancelButton}
								disabled={busy}
								onPress={() => setDeleting(null)}
							>
								<Text style={styles.cancelText}>取消</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.deleteButton} disabled={busy} onPress={confirmDelete}>
								{busy ? (
									<ActivityIndicator color="white" />
								) : (
									<Text style={styles.deleteText}>删除并迁移</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	loader: { marginTop: 80 },
	content: { padding: 16, gap: 12, paddingBottom: 40 },
	hint: { fontSize: 13, lineHeight: 19, color: colors.muted, paddingHorizontal: 4, marginBottom: 4 },
	item: { ...cardStyles.base, minHeight: 76, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
	draggingItem: {
		backgroundColor: colors.surface,
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.18,
		shadowRadius: 10,
		elevation: 8,
	},
	icon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
	info: { flex: 1, gap: 4 },
	name: { fontSize: 16, fontWeight: '600', color: colors.text },
	system: { fontSize: 11, color: colors.muted },
	actions: { flexDirection: 'row', alignItems: 'center' },
	action: { width: 34, height: 40, alignItems: 'center', justifyContent: 'center' },
	dragHandle: { width: 38, height: 48, alignItems: 'center', justifyContent: 'center' },
	headerButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		marginRight: 8,
		minHeight: 44,
		paddingHorizontal: 8,
	},
	headerButtonText: { color: colors.primary, fontWeight: '600' },
	modalRoot: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(15,23,42,0.42)' },
	modalCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, gap: 12, maxHeight: '75%' },
	modalTitle: { fontSize: 19, fontWeight: '700', color: colors.text },
	modalDescription: { fontSize: 14, color: colors.muted },
	targets: { maxHeight: 260 },
	target: {
		minHeight: 48,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingHorizontal: 12,
		borderRadius: 10,
	},
	targetActive: { backgroundColor: colors.primarySoft },
	targetText: { fontSize: 15, color: colors.text },
	modalActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
	cancelButton: {
		flex: 1,
		minHeight: 48,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.border,
	},
	cancelText: { color: colors.text, fontWeight: '600' },
	deleteButton: {
		flex: 1,
		minHeight: 48,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 12,
		backgroundColor: '#EF4444',
	},
	deleteText: { color: 'white', fontWeight: '700' },
});
