import React from "react";
import { Image, TouchableOpacity } from "react-native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { useNavigation } from '@react-navigation/native';

import HomeScreen from "../screens/User/HomeScreen";
import UserProfileScreen from "../screens/User/UserProfileScreen";
import SearchScreen from "../screens/User/SearchScreen";
import MessageScreen from "../screens/User/MessageScreen";

const Tab = createMaterialBottomTabNavigator();

// Custom component for the Post tab
function PostTab() {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('PostRecipe');
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Image
        source={require("../assets/post-icon.png")}
        style={{ width: 26, height: 26, tintColor: '#90bfa9' }}
      />
    </TouchableOpacity>
  );
}

export default function BottomNavigation_Client() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      activeColor="#90bfa9"
      inactiveColor="#f2a586"
      barStyle={{
        backgroundColor: "white",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../assets/home-icon.png")}
              style={{ width: 26, height: 26, tintColor: color }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: "Search",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../assets/search-icon.png")}
              style={{ width: 26, height: 26, tintColor: color }}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('SearchScreen');
          },
        })}
      />
      <Tab.Screen
        name="Post"
        component={PostTab}
        options={{
          tabBarLabel: "Post",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../assets/post-icon.png")}
              style={{ width: 26, height: 26, tintColor: color }}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('PostRecipe');
          },
        })}
      />
      <Tab.Screen
        name="Message"
        component={MessageScreen}
        options={{
          tabBarLabel: "Messages",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../assets/message-icon.png")}
              style={{ width: 26, height: 26, tintColor: color }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={UserProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../assets/account-icon.png")}
              style={{ width: 26, height: 26, tintColor: color }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}