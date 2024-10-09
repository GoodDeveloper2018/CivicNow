import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import EventScreen from './EventScreen';
import ReminderScreen from './ReminderScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Home">
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Events" component={EventScreen} />
        <Tab.Screen name="Reminders" component={ReminderScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
