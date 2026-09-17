import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import { ThemeColors, useAppTheme } from '../theme';

interface LoadingOverlayProps {
  visible: boolean;
  loadingText?: string;
}

export default function LoadingOverlay({ visible, loadingText = '加载中...' }: LoadingOverlayProps) {
	const { colors } = useAppTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={() => {}}>
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
});
