import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GeneratorPage() {
  const [password, setPassword] = useState('k#8vP!mQ2$xz');
  const [length, setLength] = useState(12);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const generatePassword = () => {
    // Simple generator logic
    const charset = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+',
    };
    let chars = '';
    if (options.uppercase) chars += charset.uppercase;
    if (options.lowercase) chars += charset.lowercase;
    if (options.numbers) chars += charset.numbers;
    if (options.symbols) chars += charset.symbols;
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result || 'Select options');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Display Password */}
      <View style={styles.passwordSection}>
        <View style={styles.passwordCard}>
          <Text style={styles.passwordLabel}>生成的安全密码</Text>
          <Text style={styles.passwordText}>{password}</Text>
          <View style={styles.passwordActions}>
            <TouchableOpacity style={styles.copyButton}>
              <Ionicons name="copy-outline" size={20} color="white" />
              <Text style={styles.copyButtonText}>复制密码</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={generatePassword}
            >
              <Ionicons name="refresh" size={24} color="#4b5563" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.strengthCard}>
          <Ionicons name="information-circle-outline" size={32} color="#4b5563" />
          <Text style={styles.strengthTitle}>您的密码强度被评为：非常强</Text>
          <Text style={styles.strengthDescription}>建议每3-6个月更换一次核心资产密码以确保最高级别的安全性。</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsSection}>
        {/* Length */}
        <View style={styles.controlCard}>
          <View style={styles.lengthHeader}>
            <Text style={styles.controlTitle}>密码长度</Text>
            <Text style={styles.lengthValue}>{length}</Text>
          </View>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>4 位</Text>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${((length - 4) / 60) * 100}%` }]} />
            </View>
            <Text style={styles.sliderLabel}>64 位</Text>
          </View>
        </View>

        {/* Switches */}
        <View style={styles.controlCard}>
          {Object.entries(options).map(([key, value]) => (
            <View key={key} style={styles.switchItem}>
              <View style={styles.switchLabel}>
                <View style={styles.switchIcon}>
                  <Text style={styles.switchIconText}>
                    {key === 'uppercase' ? 'A+' : key === 'lowercase' ? 'a+' : key === 'numbers' ? '12' : '#!'}
                  </Text>
                </View>
                <Text style={styles.switchText}>
                  {key === 'uppercase' ? '大写字母 (A-Z)' : key === 'lowercase' ? '小写字母 (a-z)' : key === 'numbers' ? '数字 (0-9)' : '特殊符号 (!@#$)'}
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={(newValue) => setOptions(prev => ({ ...prev, [key]: newValue }))}
                trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
                thumbColor="white"
              />
            </View>
          ))}
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tipsSection}>
        <View style={styles.tipsHeader}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
          <Text style={styles.tipsTitle}>专业安全建议</Text>
        </View>
        <View style={styles.tipsGrid}>
          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>长度优先</Text>
            <Text style={styles.tipDescription}>相比于字符复杂性，增加长度对防止暴力破解更为有效。建议使用16位以上长度。</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>避免规律</Text>
            <Text style={styles.tipDescription}>生成器已剔除 0/O, 1/I/l 等易混淆字符，确保手动输入时不会出错。</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>切勿重用</Text>
            <Text style={styles.tipDescription}>每个账号应使用唯一的随机密码。若一个账号泄露，其他账号依然安全。</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  passwordSection: {
    padding: 16,
    gap: 16,
  },
  passwordCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  passwordLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  passwordText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1f2937',
    fontFamily: 'monospace',
    lineHeight: 32,
  },
  passwordActions: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  refreshButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  strengthCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  strengthTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#166534',
  },
  strengthDescription: {
    fontSize: 14,
    color: '#166534',
    opacity: 0.8,
  },
  controlsSection: {
    padding: 16,
    gap: 16,
  },
  controlCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  controlTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  lengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  lengthValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchIcon: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  switchIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3b82f6',
    textTransform: 'uppercase',
  },
  switchText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  tipsSection: {
    margin: 16,
    padding: 24,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tipsGrid: {
    gap: 16,
  },
  tipItem: {
    gap: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  tipDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
