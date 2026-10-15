import { Tabs } from 'expo-router';
import { StyleSheet, View, type ColorValue } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const colors = {
  active: '#be185d',
  activeBackground: '#fce7f3',
  inactive: '#94a3b8',
  border: '#f1f5f9',
};

type TabIconName = 'home' | 'plus' | 'ticket' | 'profile';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 80 + insets.bottom,
            paddingBottom: insets.bottom,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <TabIcon color={color} name="home" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <TabIcon color={color} name="plus" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="my-deals"
        options={{
          title: 'My deals',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <TabIcon color={color} name="ticket" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <TabIcon color={color} name="profile" />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color }: { name: TabIconName; color: ColorValue }) {
  return (
    <Svg
      height={19}
      viewBox="0 0 24 24"
      width={19}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
    >
      {name === 'home' ? (
        <>
          <Path d="m3 11 9-8 9 8" />
          <Path d="M5 10v10h14V10M9 20v-6h6v6" />
        </>
      ) : null}
      {name === 'plus' ? <Path d="M12 5v14M5 12h14" /> : null}
      {name === 'ticket' ? (
        <>
          <Path d="M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V6Z" />
          <Path d="M13 9h3M13 15h3M8 9v6" />
        </>
      ) : null}
      {name === 'profile' ? (
        <>
          <Circle cx="12" cy="8" r="4" />
          <Path d="M4 21a8 8 0 0 1 16 0" />
        </>
      ) : null}
    </Svg>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  tabItem: {
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 0,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    width: 44,
  },
  iconContainerActive: {
    backgroundColor: colors.activeBackground,
  },
});
