import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';

const overviewMetrics = [
  { label: 'Active Users', value: '1,280', icon: 'people', color: '#4ECDC4' },
  { label: 'Daily Sign-ins', value: '432', icon: 'login', color: '#FFD166' },
  { label: 'Open Requests', value: '18', icon: 'support-agent', color: '#FF6B6B' },
  { label: 'System Health', value: '99.8%', icon: 'pulse', color: '#8B5CF6' },
];

const latestTasks = [
  { id: '1', title: 'Review content flags', subtitle: '8 flagged lessons pending review' },
  { id: '2', title: 'Approve instructor requests', subtitle: '2 new applications waiting' },
  { id: '3', title: 'Sync user data', subtitle: 'Audit backup consistency report' },
];

const marketingHighlights = [
  { id: '1', title: 'Campaign reach', subtitle: 'Monitor promo impressions and engagement.' },
  { id: '2', title: 'Email performance', subtitle: 'Track open rate and conversion trends.' },
];

const gamingHighlights = [
  { id: '1', title: 'Leaderboard pulse', subtitle: 'Review top player activity and wins.' },
  { id: '2', title: 'Match stability', subtitle: 'Check session success rate and latency.' },
];

const alerts = [
  { id: '1', label: 'New user reported abuse', status: 'High' },
  { id: '2', label: 'Database load spike', status: 'Medium' },
  { id: '3', label: 'Learning module updated', status: 'Info' },
];

export default function Admin() {
  const [activeSection, setActiveSection] = useState('Overview');
  const router = useRouter();

  const sectionTabs = [
    { label: 'Overview', key: 'Overview' },
    { label: 'Marketing', key: 'Marketing' },
    { label: 'Gaming', key: 'Gaming' },
    { label: 'Alerts', key: 'Alerts' },
  ];

  const renderSection = () => {
    if (activeSection === 'Marketing') {
      return (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Marketing snapshot</Text>
            <TouchableOpacity style={styles.actionBadge} activeOpacity={0.8} onPress={() => router.push('/community')}>
              <Text style={styles.actionBadgeText}>Launch</Text>
            </TouchableOpacity>
          </View>
          {marketingHighlights.map((item) => (
            <View key={item.id} style={styles.infoRow}>
              <View style={[styles.statusDot, { backgroundColor: '#FFD166' }]} />
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.85} onPress={() => router.push('/community')}>
            <Text style={styles.actionButtonLabel}>Open campaign manager</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeSection === 'Gaming') {
      return (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gaming operations</Text>
            <TouchableOpacity style={styles.actionBadge} activeOpacity={0.8} onPress={() => router.push('/game')}>
              <Text style={styles.actionBadgeText}>Review</Text>
            </TouchableOpacity>
          </View>
          {gamingHighlights.map((item) => (
            <View key={item.id} style={styles.infoRow}>
              <View style={[styles.statusDot, { backgroundColor: '#4ECDC4' }]} />
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.85} onPress={() => router.push('/game')}>
            <Text style={styles.actionButtonLabel}>Open live game preview</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeSection === 'Alerts') {
      return (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active alerts</Text>
            <TouchableOpacity style={styles.actionBadge} activeOpacity={0.8} onPress={() => router.push('/help-support')}>
              <Text style={styles.actionBadgeText}>Resolve</Text>
            </TouchableOpacity>
          </View>
          {alerts.map((alert) => (
            <View key={alert.id} style={styles.alertRow}>
              <View style={[styles.alertMarker, alert.status === 'High' ? styles.alertHigh : alert.status === 'Medium' ? styles.alertMedium : styles.alertInfo]} />
              <Text style={styles.alertText}>{alert.label}</Text>
              <TouchableOpacity onPress={() => router.push('/help-support')}>
                <Text style={styles.alertAction}>View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      );
    }

    return (
      <>
        <View style={styles.metricRow}>
          {overviewMetrics.map((metric) => (
            <View key={metric.label} style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: metric.color }]}> 
                <MaterialIcons name={metric.icon} size={20} color="#FFF" />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>Tap to manage core admin workflows.</Text>
          </View>
          <View style={styles.actionList}>
            <TouchableOpacity style={styles.actionItem} activeOpacity={0.85} onPress={() => router.push('/settings')}>
              <View style={styles.actionIcon}> 
                <Feather name="settings" size={18} color="#4ECDC4" />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Platform settings</Text>
                <Text style={styles.actionSubtitle}>Update global configuration and permissions.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#A49B8A" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} activeOpacity={0.85} onPress={() => router.push('/community')}>
              <View style={styles.actionIcon}> 
                <Ionicons name="trending-up" size={18} color="#FFD166" />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Marketing center</Text>
                <Text style={styles.actionSubtitle}>Launch campaigns and view engagement data.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#A49B8A" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} activeOpacity={0.85} onPress={() => router.push('/game')}>
              <View style={styles.actionIcon}> 
                <Ionicons name="game-controller" size={18} color="#8B5CF6" />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Gaming dashboard</Text>
                <Text style={styles.actionSubtitle}>Review sessions, leaderboards, and stability.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#A49B8A" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionCard}> 
          <Text style={styles.sectionTitle}>Task overview</Text>
          {latestTasks.map((task) => (
            <View key={task.id} style={styles.taskRow}>
              <View style={styles.taskDot} />
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskSubtitle}>{task.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D7C6" />
      <View style={styles.page}> 
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/home')} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerText}> 
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Operations, marketing, and game management in one place.</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          {sectionTabs.map((section) => (
            <TouchableOpacity
              key={section.key}
              style={[styles.tabButton, activeSection === section.key && styles.tabButtonActive]}
              activeOpacity={0.85}
              onPress={() => setActiveSection(section.key)}
            >
              <Text style={[styles.tabButtonLabel, activeSection === section.key && styles.tabButtonLabelActive]}>{section.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderSection()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8D7C6',
  },
  page: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 28,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#89827E',
  },
  actionBadge: {
    backgroundColor: '#E6FBF8',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  actionBadgeText: {
    color: '#4ECDC4',
    fontWeight: '700',
    fontSize: 12,
  },
  actionList: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F3EEE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  taskDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ECDC4',
    marginTop: 8,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingVertical: 12,
    backgroundColor: '#F7F1EB',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFF',
    borderColor: '#D4C4B0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tabButtonLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7D756E',
  },
  tabButtonLabelActive: {
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  actionButton: {
    marginTop: 16,
    backgroundColor: '#4ECDC4',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonLabel: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  taskSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginTop: 4,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  alertMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  alertHigh: {
    backgroundColor: '#FF6B6B',
  },
  alertMedium: {
    backgroundColor: '#FFD166',
  },
  alertInfo: {
    backgroundColor: '#4ECDC4',
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  alertStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
});
