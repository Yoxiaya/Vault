import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { calculatePasswordStrength } from '../utils';

export type StrengthMode = 'bars' | 'progress';

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
	const strength = useMemo(() => calculatePasswordStrength(password), [password]);
	const percentage = Math.min((strength.score / 5) * 100, 100);

	if (mode === 'progress') {
		return (
			<View style={styles.progressContainer}>
				<View style={styles.progressBarBackground}>
					<View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: strength.color }]} />
				</View>
				<View style={styles.progressInfo}>
					<Text style={[styles.levelText, { color: strength.color }]}>密码强度：{strength.level}</Text>
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
							index < strength.score ? { backgroundColor: strength.color } : styles.barEmpty,
						]}
					/>
				))}
			</View>
			<View style={styles.info}>
				<Text style={[styles.levelText, { color: strength.color }]}>密码强度：{strength.level}</Text>
				{showFeedback && strength.feedback && <Text style={styles.feedbackText}>{strength.feedback}</Text>}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
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
		backgroundColor: '#f3f4f6',
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
		color: '#6b7280',
		flex: 1,
	},
	progressContainer: {
		marginTop: 12,
	},
	progressBarBackground: {
		height: 6,
		backgroundColor: '#f3f4f6',
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
