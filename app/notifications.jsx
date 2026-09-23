import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useNotifications } from './notification-context';

export default function Notifications() {
  const router = useRouter();
  const { notifications, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);


  const handleNotificationAction = (notification) => {
    markAsRead(notification.id);
    if (notification.route) {
      router.push(notification.route);
    }
  };

  const renderNotificationCard = ({ item, index }) => (
    <Animated.View
      key={item.id}
      style={[
        styles.notificationCard,
        !item.read && styles.notificationUnread,
        { opacity: fadeAnim },
      ]}
    >
      <TouchableOpacity
        style={styles.notificationContent}
        onPress={() => handleNotificationAction(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { opacity: item.read ? 0.5 : 1 }]}>
          <MaterialIcons name={item.icon} size={24} color="#4ECDC4" />
        </View>

        <View style={styles.textContent}>
          <Text style={[styles.notificationTitle, !item.read && styles.titleBold]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => deleteNotification(item.id)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="close" size={20} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>

      {item.actionLabel && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleNotificationAction(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>{item.actionLabel}</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#FFF" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D7C6" />

      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={28} color="#333" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={styles.headerSubtitle}>
                {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Actionable updates</Text>
          <Text style={styles.summaryText}>
            Review the latest alerts, open lessons, and keep your learning progress on track from one place.
          </Text>
        </View>

        <Text style={styles.introText}>
          Tap any notification to go directly to the related lesson, profile activity, or progress screen.
        </Text>

        {notifications.length > 0 ? (
          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {notifications.map((notification, index) =>
              renderNotificationCard({ item: notification, index })
            )}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={60} color="#AAA" />
            <Text style={styles.emptyTitle}>No new alerts</Text>
            <Text style={styles.emptyMessage}>
              You&apos;re all caught up! Explore lessons or return later for updates.
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/learn')}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreButtonText}>Explore lessons</Text>
            </TouchableOpacity>
          </View>
        )}

        {unreadCount > 0 && (
          <View style={styles.footerButton}>
            <TouchableOpacity
              onPress={markAllAsRead}
              style={styles.markAllButton}
              activeOpacity={0.7}
            >
              <Text style={styles.markAllButtonText}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8D7C6',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#E8D7C6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 24,
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
  },
  notificationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  notificationUnread: {
    backgroundColor: '#F8FDFD',
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F7F5',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  titleBold: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  introText: {
    marginHorizontal: 20,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 20,
    color: '#555',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: '#FFF',
  },
  markAllButton: {
    backgroundColor: '#FFD166',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  markAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  exploreButton: {
    marginTop: 18,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});
