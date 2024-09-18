import { View, Text } from "react-native";
import React from "react";
import { Image, TouchableOpacity } from "react-native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { useNavigation } from "@react-navigation/native";

import Admin_Home from "../screens/Admin/Admin_Home";
import Admin_Report from "../screens/Admin/Admin_Report";
import Admin_Verification from "../screens/Admin/Admin_Verification";

const Tab = createMaterialBottomTabNavigator();

export default function BottomNavigation_Admin() {
  return (
    <Tab.Navigator
      initialRouteName="Admin_Home"
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
        name="Admin_Home"
        component={Admin_Home}
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
        name="Admin_Report"
        component={Admin_Report}
        options={{
          tabBarLabel: "Reported Account",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../assets/report-icon.png")}
              style={{ width: 26, height: 26, tintColor: color }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Admin_Verification"
        component={Admin_Verification}
        options={{
          tabBarLabel: "Verification Request",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../assets/verification-icon.png")}
              style={{ width: 26, height: 26, tintColor: color }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
