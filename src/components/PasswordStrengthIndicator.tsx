import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { calculatePasswordStrength } from '../utils';
import { ThemeColors, useAppTheme } from '../theme';

type StrengthMode = 'bars' | 'progress';

interface PasswordStrengthIndicatorProps {
	password: string;
	showFeedback?: boolean;
	mode?: StrengthMode;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
	password,
	showFeedback = true,
	mode = 'bars',
}) => {
	const { colors } = useAppTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const strength = useMemo(() => calculatePasswordStrength(password), [password]);
	const percentage = Math.min((strength.score / 5) * 100, 100);
	const indicatorColor = strength.score < 2 ? '#EF4444' : strength.score < 3.5 ? '#F59E0B' : colors.primary;

	if (mode === 'progress') {
		return (
			<View style={styles.progressContainer}>
				<View style={styles.progressBarBackground}>
					<View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: indicatorColor }]} />
				</View>
				<View style={styles.progressInfo}>
					<Text style={[styles.levelText, { color: indicatorColor }]}>密码强度：{strength.level}</Text>
					{showFeedback && strength.feedback && <Text style={styles.feedbackText}>{strength.feedback}</Text>}
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.meter}>
				{[...Array(5)].map((_, index) => (
					<View
						key={index}
						style={[
							styles.bar,
							index < strength.score ? { backgroundColor: indicatorColor } : styles.barEmpty,
						]}
					/>
				))}
			</View>
			<View style={styles.info}>
				<Text style={[styles.levelText, { color: indicatorColor }]}>密码强度：{strength.level}</Text>
				{showFeedback && strength.feedback && <Text style={styles.feedbackText}>{strength.feedback}</Text>}
			</View>
		</View>
	);
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
	container: {
		marginTop: 12,
	},
	meter: {
		flexDirection: 'row',
		gap: 4,
		height: 4,
		marginBottom: 4,
	},
	bar: {
		flex: 1,
		borderRadius: 2,
	},
	barEmpty: {
		backgroundColor: colors.border,
	},
	info: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	levelText: {
		fontSize: 12,
		fontWeight: '500',
	},
	feedbackText: {
		fontSize: 12,
		color: colors.muted,
		flex: 1,
	},
	progressContainer: {
		marginTop: 12,
	},
	progressBarBackground: {
		height: 6,
		backgroundColor: colors.border,
		borderRadius: 3,
		overflow: 'hidden',
	},
	progressBar: {
		height: '100%',
		borderRadius: 3,
	},
	progressInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		marginTop: 4,
	},
});

export default PasswordStrengthIndicator;
