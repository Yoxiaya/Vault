import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsPage() {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const sections = [
    {
      title: '账户设置',
      items: [
        { label: '修改主密码', icon: 'lock-closed-outline', type: 'link' },
        { label: '自动填充设置', icon: 'document-text-outline', type: 'link' },
        { label: '生物识别登录', icon: 'finger-print', type: 'switch', value: biometricEnabled, onValueChange: setBiometricEnabled },
      ]
    },
    {
      title: '应用偏好',
      items: [
        { label: '深色模式', icon: 'moon-outline', type: 'switch', value: darkModeEnabled, onValueChange: setDarkModeEnabled },
        { label: '语言选择', icon: 'globe-outline', type: 'select', value: '简体中文' },
        { label: '清除剪贴板时长', icon: 'time-outline', type: 'select', value: '30秒' },
      ]
    },
    {
      title: '关于与支持',
      items: [
        { label: '帮助与支持', icon: 'help-circle-outline', type: 'external' },
        { label: '隐私政策', icon: 'shield-checkmark-outline', type: 'link' },
        { label: '关于 Vault', icon: 'information-circle-outline', type: 'text', value: 'Version 2.4.0' },
      ]
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User Profile */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTwtj3sCDJir1dwWvqOJD2js3Fylp57dtHzbSr_afG8e5919ApouEeRKcNtfsXvodvNyxMyxpWyHbu7ENzrS-udrCaqkLBGrObOvP-XcYFQdPhIHxPfIHeBBEHKumgODPeXKMNTPp-BetxmEk3GVOEfxDFsED5LMDjMKpEqFCm0vZ9vyeFOIv57RTXI1HuZsPSDoMWp1mgOGLKVFbf1AqWE8TGBi130fF3mAApReyzlT1ghy-5_U2lumFoK1ZmQyMFniLP_1nwbZY' }} 
            style={styles.profileImage}
          />
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={14} color="white" />
          </View>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Alex Designer</Text>
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#3b82f6" />
            <Text style={styles.securityBadgeText}>安全等级：极高</Text>
          </View>
        </View>
      </View>

      {/* Settings Groups */}
      <View style={styles.settingsSections}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, idx) => (
                <TouchableOpacity 
                  key={item.label} 
                  style={[
                    styles.settingItem,
                    idx !== section.items.length - 1 && styles.settingItemBorder
                  ]}
                >
                  <View style={styles.settingItemLeft}>
                    <View style={styles.settingIcon}>
                      <Ionicons name={item.icon as any} size={20} color="#3b82f6" />
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  
                  {item.type === 'link' && (
                    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                  )}
                  
                  {item.type === 'switch' && (
                    <Switch
                      value={item.value}
                      onValueChange={item.onValueChange}
                      trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
                      thumbColor="white"
                    />
                  )}
                  
                  {item.type === 'select' && (
                    <View style={styles.selectContainer}>
                      <Text style={styles.selectValue}>{item.value}</Text>
                      <Ionicons name="chevron-down" size={20} color="#6b7280" />
                    </View>
                  )}
                  
                  {item.type === 'external' && (
                    <Ionicons name="open-outline" size={20} color="#6b7280" />
                  )}
                  
                  {item.type === 'text' && (
                    <Text style={styles.textValue}>{item.value}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Logout */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>退出登录</Text>
        </TouchableOpacity>
        <Text style={styles.encryptionText}>Secured by Quantum Encryption</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  profileSection: {
    margin: 16,
    padding: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f3f4f6',
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  securityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  settingsSections: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 8,
  },
  sectionContent: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  textValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutSection: {
    padding: 16,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 24,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  encryptionText: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
