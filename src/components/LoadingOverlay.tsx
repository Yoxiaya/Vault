import React from 'react';
import { View, Text, ActivityIndicator, Modal, StyleSheet } from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  loadingText?: string;
}

export default function LoadingOverlay({ visible, loadingText = '加载中...' }: LoadingOverlayProps) {
  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={() => {}}>
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
});