import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: 'joined-deal',
    title: 'Anya P. joined your deal',
    message: 'Your Sunday pizza bundle now has 3 participants.',
    time: '10 min ago',
    isRead: false,
  },
  {
    id: 'deal-complete',
    title: 'Your Katsu & Co. deal is complete',
    message: 'Everyone has paid. Your order is ready to go!',
    time: '2 hours ago',
    isRead: false,
  },
  {
    id: 'deal-canceled',
    title: 'Deal canceled',
    message: 'Your refund for Sunday pizza bundle is in progress.',
    time: 'Yesterday',
    isRead: true,
  },
  {
    id: 'payment-reminder',
    title: 'Payment reminder',
    message: 'Complete your payment for Matcha latte delivery.',
    time: '2 days ago',
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications] = useState(initialNotifications);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <Svg
              fill="none"
              height={22}
              stroke="#334155"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
              width={22}
            >
              <Path d="m15 18-6-6 6-6" />
            </Svg>
          </Pressable>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.notificationList}>
          {notifications.map((notification) => (
            <Pressable
              accessibilityRole="button"
              key={notification.id}
              onPress={() => router.push('/(tabs)/my-deals')}
              style={({ pressed }) => [
                styles.notificationCard,
                pressed && styles.notificationCardPressed,
              ]}
            >
              <View
                style={[
                  styles.readIndicator,
                  notification.isRead && styles.readIndicatorHidden,
                ]}
              />
              <View style={styles.notificationCopy}>
                <View style={styles.notificationHeading}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
                </View>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#fdf2f8',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  title: {
    color: '#0f172a',
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 16,
  },
  headerSpacer: {
    width: 40,
  },
  notificationList: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  notificationCard: {
    alignItems: 'flex-start',
    borderBottomColor: '#f1f5f9',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 18,
  },
  notificationCardPressed: {
    backgroundColor: '#fff7fb',
  },
  readIndicator: {
    backgroundColor: '#db2777',
    borderRadius: 4,
    height: 8,
    marginTop: 5,
    width: 8,
  },
  readIndicatorHidden: {
    opacity: 0,
  },
  notificationCopy: {
    flex: 1,
    gap: 5,
  },
  notificationHeading: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  notificationTitle: {
    color: '#0f172a',
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  notificationTime: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    paddingTop: 2,
  },
  notificationMessage: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
});
