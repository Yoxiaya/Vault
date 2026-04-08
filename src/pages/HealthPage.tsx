import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HealthPage() {
  const stats = [
    { label: '泄露账户', value: '0', icon: 'alert-circle-outline', badge: '实时监测', badgeColor: 'bg-surface-container-highest' },
    { label: '弱密码', value: '3', icon: 'key-outline', badge: '建议优化', badgeColor: 'bg-error-container/10 text-error' },
    { label: '2FA 开启率', value: '85%', icon: 'phone-portrait-outline', badge: '保护中', badgeColor: 'bg-primary-container/20 text-primary' },
  ];

  const logs = [
    { title: '新登录提醒', desc: '从新的 IP 地址 (192.168.1.1) 登录了您的账户', time: '刚刚', icon: 'log-in-outline' },
    { title: '密码已更新', desc: 'GitHub 账户的密码已成功更改', time: '2小时前', icon: 'key-outline' },
    { title: '设备信任授权', desc: '授权了新的 MacBook Pro 访问保险库', time: '昨天', icon: 'phone-portrait-outline' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>安全健康状况</Text>
          <Text style={styles.heroDescription}>
            您的 Vault 正在为您提供卓越的保护。通过启用双重身份验证和更新弱密码，进一步提升您的安全等级。
          </Text>
          <TouchableOpacity style={styles.heroButton}>
            <Text style={styles.heroButtonText}>了解更多</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.securityScoreContainer}>
          <View style={styles.scoreCircle}>
            <View style={styles.scoreCircleBackground} />
            <View style={styles.scoreCircleProgress} />
            <View style={styles.scoreTextContainer}>
              <Text style={styles.scoreValue}>90</Text>
              <Text style={styles.scoreLabel}>安全分</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsSection}>
        {stats.map((stat, index) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name={stat.icon as any} size={24} color="#93c5fd" />
              <View style={[
                styles.badge,
                stat.badgeColor.includes('error') ? styles.errorBadge : 
                stat.badgeColor.includes('primary') ? styles.primaryBadge : 
                styles.defaultBadge
              ]}>
                <Text style={[
                  styles.badgeText,
                  stat.badgeColor.includes('error') ? styles.errorBadgeText : 
                  stat.badgeColor.includes('primary') ? styles.primaryBadgeText : 
                  styles.defaultBadgeText
                ]}>{stat.badge}</Text>
              </View>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Audit Log */}
      <View style={styles.logsSection}>
        <View style={styles.logsHeader}>
          <View>
            <Text style={styles.logsTitle}>审计日志</Text>
            <Text style={styles.logsDescription}>最近的安全相关活动</Text>
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>查看全部</Text>
            <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        <View style={styles.logsList}>
          {logs.map((log, index) => (
            <TouchableOpacity key={index} style={styles.logItem}>
              <View style={styles.logIcon}>
                <Ionicons name={log.icon as any} size={24} color="#3b82f6" />
              </View>
              <View style={styles.logContent}>
                <Text style={styles.logTitle}>{log.title}</Text>
                <Text style={styles.logDescription}>{log.desc}</Text>
              </View>
              <Text style={styles.logTime}>{log.time}</Text>
            </TouchableOpacity>
          ))}
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
  heroSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 24,
    alignItems: 'center',
  },
  heroContent: {
    flex: 1,
    gap: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  heroDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  heroButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  securityScoreContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreCircleBackground: {
    position: 'absolute',
    width: 224,
    height: 224,
    borderRadius: 112,
    borderWidth: 12,
    borderColor: '#f9fafb',
  },
  scoreCircleProgress: {
    position: 'absolute',
    width: 224,
    height: 224,
    borderRadius: 112,
    borderWidth: 12,
    borderColor: '#3b82f6',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
  },
  scoreTextContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadge: {
    backgroundColor: '#f3f4f6',
  },
  errorBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  primaryBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  defaultBadgeText: {
    color: '#4b5563',
  },
  errorBadgeText: {
    color: '#ef4444',
  },
  primaryBadgeText: {
    color: '#3b82f6',
  },
  statContent: {
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  logsSection: {
    margin: 16,
    padding: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 24,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  logsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  logsDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  logsList: {
    gap: 4,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
  },
  logIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logContent: {
    flex: 1,
    gap: 4,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  logDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  logTime: {
    fontSize: 14,
    color: '#6b7280',
  },
});
