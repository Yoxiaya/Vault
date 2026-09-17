import React, { useMemo } from 'react';
import {
	ActivityIndicator,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccountCategory } from '../type';
import { ThemeColors, useAppTheme } from '../theme';

export const createModalStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		modalRoot: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(15,23,42,0.42)' },
		modalCard: {
			backgroundColor: colors.card,
			borderColor: colors.border,
			borderWidth: 1,
			borderRadius: 20,
			padding: 20,
			gap: 12,
			maxHeight: '75%',
		},
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

interface DeleteCategoryModalProps {
	deleting: AccountCategory | null;
	categories: AccountCategory[];
	moveTo: string | null;
	busy: boolean;
	onSetMoveTo: (id: string | null) => void;
	onConfirm: () => void;
	onClose: () => void;
}

export default function DeleteCategoryModal({
	deleting,
	categories,
	moveTo,
	busy,
	onSetMoveTo,
	onConfirm,
	onClose,
}: DeleteCategoryModalProps) {
	const { colors } = useAppTheme();
	const styles = useMemo(() => createModalStyles(colors), [colors]);
	if (!deleting) return null;

	const targets = [
		{ id: null, name: '未分类' },
		...categories
			.filter((item) => item.id !== deleting.id)
			.map((item) => ({ id: item.id, name: item.name })),
	];

	return (
		<Modal visible transparent animationType="fade" onRequestClose={() => !busy && onClose()}>
			<View style={styles.modalRoot}>
				<Pressable style={StyleSheet.absoluteFill} onPress={() => !busy && onClose()} />
				<View style={styles.modalCard}>
					<Text style={styles.modalTitle}>删除&ldquo;{deleting.name}&rdquo;</Text>
					<Text style={styles.modalDescription}>请选择该分类下账户的迁移位置：</Text>
					<ScrollView style={styles.targets}>
						{targets.map((target) => (
							<TouchableOpacity
								key={target.id || 'none'}
								style={[styles.target, moveTo === target.id && styles.targetActive]}
								onPress={() => onSetMoveTo(target.id)}
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
						<TouchableOpacity style={styles.cancelButton} disabled={busy} onPress={onClose}>
							<Text style={styles.cancelText}>取消</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.deleteButton} disabled={busy} onPress={onConfirm}>
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
	);
}
