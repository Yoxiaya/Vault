import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ── Config ─────────────────────────────────────────────

export interface CategoryOption {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

// ── Props ───────────────────────────────────────────────

interface CategoryPickerProps {
  value: string;
  options: CategoryOption[];
  onChange: (key: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

// ── Component ───────────────────────────────────────────

export default function CategoryPicker({
  value,
  options,
  onChange,
  disabled = false,
  hasError = false,
}: CategoryPickerProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.key === value) || options[0];
  const cardWidth = (screenWidth - 56) / 3;

  // 动画
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(300)).current;

  const open = () => {
    setVisible(true);
  };

  const close = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      cb?.();
    });
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          damping: 22,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSelect = (key: string) => {
    onChange(key);
    close();
  };

  return (
    <>
      {/* 触发按钮 */}
      <TouchableOpacity
        style={[styles.trigger, hasError && styles.triggerError]}
        onPress={open}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.triggerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: selected.color + '18' }]}>
            <Ionicons name={selected.icon} size={18} color={selected.color} />
          </View>
          <Text style={styles.triggerText}>{selected.label}</Text>
        </View>
        <Ionicons name="grid-outline" size={18} color="#9ca3af" />
      </TouchableOpacity>

      {/* 选择弹窗 */}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={() => close()}
      >
        <View style={styles.modalWrapper}>
          {/* 遮罩 — 只做渐隐渐显 */}
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} />
          </Animated.View>

          {/* 面板 — 从下方滑入 */}
          <Animated.View
            style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}
          >
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>选择账号类型</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => close()}>
                <Ionicons name="close" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.grid}>
              {options.map((opt) => {
                const isActive = opt.key === value;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.card,
                      { width: cardWidth },
                      isActive && styles.cardActive,
                    ]}
                    onPress={() => handleSelect(opt.key)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.cardIconWrap,
                        { backgroundColor: opt.color + '14' },
                        isActive && { backgroundColor: opt.color + '22' },
                      ]}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={28}
                        color={isActive ? opt.color : '#6b7280'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.cardLabel,
                        isActive && { color: opt.color, fontWeight: '600' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isActive && (
                      <View style={[styles.checkmark, { backgroundColor: opt.color }]}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
              {Array.from({ length: (3 - (options.length % 3)) % 3 }).map((_, i) => (
                <View key={`spacer-${i}`} style={[styles.card, { width: cardWidth, opacity: 0 }]} />
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

// ── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingLeft: 12,
    paddingRight: 14,
    paddingVertical: 10,
    minHeight: 48,
  },
  triggerError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },

  // Modal
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    paddingTop: 8,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeBtn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    rowGap: 12,
  },
  card: {
    aspectRatio: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  cardActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  cardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
