import React, { useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { useCategoriesStore } from '../store';
import { CategoryColor, CategoryIcon } from '../type';
import { categoryColorMap, categoryColors, categoryIconMap, categoryIcons } from '../constants/category';
import { ApiError } from '../service';
import { useToast } from '../components/Toast';
import { cardStyles, colors } from '../theme';

type PageRoute = RouteProp<RootStackParamList, 'CategoryEditPage'>;
type PageNavigation = NativeStackNavigationProp<RootStackParamList, 'CategoryEditPage'>;

export default function CategoryEditPage() {
	const route = useRoute<PageRoute>();
	const navigation = useNavigation<PageNavigation>();
	const toast = useToast();
	const { categories, createCategory, updateCategory } = useCategoriesStore();
	const category = useMemo(
		() => categories.find((item) => item.id === route.params?.id),
		[categories, route.params?.id]
	);
	const [name, setName] = useState(category?.name || '');
	const [icon, setIcon] = useState<CategoryIcon>(category?.icon || 'folder');
	const [color, setColor] = useState<CategoryColor>(category?.color || 'blue');
	const [saving, setSaving] = useState(false);
	const isEditing = !!route.params?.id;

	useLayoutEffect(() => {
		navigation.setOptions({ title: isEditing ? '编辑分类' : '新增分类' });
	}, [isEditing, navigation]);

	const save = async () => {
		const normalizedName = name.trim();
		if (!normalizedName) {
			toast.warning('请输入分类名称');
			return;
		}
		if (normalizedName.length > 20) {
			toast.warning('名称过长', '分类名称最多 20 个字符');
			return;
		}
		setSaving(true);
		try {
			if (category) await updateCategory(category.id, { name: normalizedName, icon, color });
			else await createCategory({ name: normalizedName, icon, color });
			toast.success(isEditing ? '分类已更新' : '分类已创建');
			navigation.goBack();
		} catch (error) {
			if (error instanceof ApiError && error.status === 409) toast.error('名称已存在', '请换一个分类名称');
			else if (error instanceof ApiError && error.status === 422) toast.error('无法保存', error.message);
			else toast.error('保存失败', error instanceof Error ? error.message : '请稍后重试');
		} finally {
			setSaving(false);
		}
	};

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<View style={styles.preview}>
				<View style={[styles.previewIcon, { backgroundColor: `${categoryColorMap[color]}18` }]}>
					<Ionicons name={categoryIconMap[icon]} size={32} color={categoryColorMap[color]} />
				</View>
				<Text style={styles.previewName}>{name.trim() || '分类名称'}</Text>
			</View>

			<View style={styles.section}>
				<Text style={styles.label}>名称</Text>
				<TextInput
					value={name}
					onChangeText={setName}
					maxLength={20}
					placeholder="例如：学习"
					placeholderTextColor="#98A2B3"
					style={styles.input}
				/>
				<Text style={styles.counter}>{name.length}/20</Text>
			</View>

			<View style={styles.section}>
				<Text style={styles.label}>图标</Text>
				<View style={styles.grid}>
					{categoryIcons.map((item) => (
						<TouchableOpacity
							key={item}
							style={[styles.choice, icon === item && styles.choiceActive]}
							onPress={() => setIcon(item)}
						>
							<Ionicons
								name={categoryIconMap[item]}
								size={25}
								color={icon === item ? categoryColorMap[color] : colors.muted}
							/>
						</TouchableOpacity>
					))}
				</View>
			</View>

			<View style={styles.section}>
				<Text style={styles.label}>颜色</Text>
				<View style={styles.colorRow}>
					{categoryColors.map((item) => (
						<TouchableOpacity
							key={item}
							style={[
								styles.colorChoice,
								{ backgroundColor: categoryColorMap[item] },
								color === item && styles.colorActive,
							]}
							onPress={() => setColor(item)}
						>
							{color === item && <Ionicons name="checkmark" size={20} color="white" />}
						</TouchableOpacity>
					))}
				</View>
			</View>

			<TouchableOpacity style={[styles.saveButton, saving && styles.disabled]} onPress={save} disabled={saving}>
				{saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>保存分类</Text>}
			</TouchableOpacity>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	content: { padding: 20, gap: 18, paddingBottom: 40 },
	preview: { ...cardStyles.base, padding: 24, alignItems: 'center', gap: 12 },
	previewIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
	previewName: { fontSize: 18, fontWeight: '700', color: colors.text },
	section: { ...cardStyles.base, padding: 16, gap: 12 },
	label: { fontSize: 14, fontWeight: '700', color: colors.text },
	input: {
		minHeight: 50,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 12,
		paddingHorizontal: 14,
		backgroundColor: colors.surface,
		fontSize: 16,
		color: colors.text,
	},
	counter: { alignSelf: 'flex-end', fontSize: 12, color: colors.muted },
	grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
	choice: {
		width: 52,
		height: 52,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.surface,
	},
	choiceActive: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primarySoft },
	colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 13 },
	colorChoice: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
	colorActive: { borderWidth: 3, borderColor: '#FFFFFF', outlineWidth: 2, outlineColor: colors.text },
	saveButton: {
		minHeight: 52,
		borderRadius: 14,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	saveText: { color: 'white', fontSize: 16, fontWeight: '700' },
	disabled: { opacity: 0.6 },
});
