import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { useAccountsStore, useCategoriesStore } from '../store';
import { AccountCategory } from '../type';
import { useToast } from '../components/Toast';
import { ThemeColors, useAppTheme } from '../theme';
import DraggableCategoryRow from '../components/DraggableCategoryRow';
import DeleteCategoryModal from '../components/DeleteCategoryModal';
import { Sortable, SortableItem, SortableRenderItemProps } from 'react-native-reanimated-dnd';

type PageNavigation = NativeStackNavigationProp<RootStackParamList, 'CategoryManagementPage'>;

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { flex: 1, backgroundColor: colors.page },
		loader: { marginTop: 80 },
		hint: { fontSize: 13, lineHeight: 19, color: colors.muted, paddingHorizontal: 4, marginBottom: 4 },
		headerButton: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 3,
			marginRight: 8,
			minHeight: 44,
			paddingHorizontal: 8,
		},
		headerButtonText: { color: colors.primary, fontWeight: '600' },
	});

export default function CategoryManagementPage() {
	const { colors } = useAppTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const navigation = useNavigation<PageNavigation>();
	const toast = useToast();
	const { categories, loading, fetchCategories, reorderCategories, deleteCategory } = useCategoriesStore();
	const { fetchAccounts } = useAccountsStore();
	const [deleting, setDeleting] = useState<AccountCategory | null>(null);
	const [moveTo, setMoveTo] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [libraryActiveId, setLibraryActiveId] = useState<string | null>(null);
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
	}, [colors.primary, navigation, styles.headerButton, styles.headerButtonText]);

	useEffect(() => {
		fetchCategories().catch(() => toast.error('加载失败', '无法获取账号分类'));
	}, []);

	useEffect(() => {
		setDisplayCategories(categories);
	}, [categories]);

	const handleLibraryDrop = useCallback(
		async (_id: string, _position: number, allPositions?: Record<string, number>) => {
			setLibraryActiveId(null);
			if (!allPositions || busy) return;
			const next = [...displayCategories].sort(
				(a, b) => (allPositions[a.id] ?? 0) - (allPositions[b.id] ?? 0)
			);
			if (next.every((item, index) => item.id === displayCategories[index]?.id)) return;

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
		},
		[busy, categories, displayCategories, reorderCategories, toast]
	);

	const renderCategory = useCallback(
		({ item, id, ...sortableProps }: SortableRenderItemProps<AccountCategory>) => (
			<SortableItem
				{...sortableProps}
				id={id}
				data={item}
				onDragStart={() => setLibraryActiveId(id)}
				onDrop={handleLibraryDrop}
			>
				<DraggableCategoryRow
					category={item}
					disabled={busy}
					isActive={libraryActiveId === id}
					onEdit={() => navigation.navigate('CategoryEditPage', { id: item.id })}
					onDelete={() => {
						setDeleting(item);
						setMoveTo(null);
					}}
				/>
			</SortableItem>
		),
		[busy, handleLibraryDrop, libraryActiveId, navigation]
	);

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
				<View style={{ flex: 1 }}>
					<Text style={[styles.hint, { marginHorizontal: 16, marginVertical: 12 }]}>
						点击分类可编辑，向左滑动可删除；按住右侧手柄可调整顺序。
					</Text>
					<Sortable
						data={displayCategories}
						renderItem={renderCategory}
						itemHeight={88}
						style={{ backgroundColor: colors.page }}
						contentContainerStyle={{ paddingBottom: 40 }}
					/>
				</View>
			)}

			<DeleteCategoryModal
				deleting={deleting}
				categories={categories}
				moveTo={moveTo}
				busy={busy}
				onSetMoveTo={setMoveTo}
				onConfirm={confirmDelete}
				onClose={() => setDeleting(null)}
			/>
		</View>
	);
}
