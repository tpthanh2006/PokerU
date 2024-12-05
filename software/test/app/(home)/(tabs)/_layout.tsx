import React from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../../components/ui/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="HomePage"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="FindGamesPage"
        options={{
          title: 'Find Games',
        }}
      />
      <Tabs.Screen
        name="ChatPage"
        options={{
          title: 'Chat',
        }}
      />
      <Tabs.Screen
        name="ProfilePage"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
