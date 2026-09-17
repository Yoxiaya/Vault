import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { ThemeColors, useAppTheme } from '../theme';

export const LoadingMask = ({ visible }: { visible: boolean }) => {
	const { colors } = useAppTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	if (!visible) return null;

	return (
		<View style={styles.mask}>
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={colors.primary} />
				<Text style={styles.loadingText}>正在保存...</Text>
			</View>
		</View>
	);
};
const createStyles = (colors: ThemeColors) => StyleSheet.create({
	mask: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1000,
	},
	loadingContainer: {
		backgroundColor: colors.card,
		padding: 20,
		borderRadius: 12,
		alignItems: 'center',
		gap: 12,
		minWidth: 150,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	loadingText: {
		fontSize: 16,
		color: colors.text,
		fontWeight: '500',
	},
});
