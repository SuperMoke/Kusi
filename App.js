import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  Provider as PaperProvider,
  DefaultTheme,
  configureFonts,
} from "react-native-paper";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

import PostRecipeScreen from "./screens/User/PostRecipeScreen";
import RecipeDetailScreen from "./screens/User/RecipeDetailScreen";
import CommentScreen from "./screens/User/CommentScreen";
import ProfileScreen from "./screens/User/ProfileScreen";
import ChatScreen from "./screens/User/ChatScreen";
import SavedRecipesScreen from "./screens/User/SavedRecipeScreen";
import NotificationScreen from "./screens/User/NotificationScreen";
import EditProfileScreen from "./screens/User/EditProfileScreen";
import SearchScreen from "./screens/User/SearchScreen";
import VerificationRequestScreen from "./screens/User/VerificationRequestScreen";
import ReportAccountScreen from "./screens/User/ReportAccountScreen";

//Admin Screen
import Admin_ReportDetail from "./screens/Admin/Admin_ReportDetail";

import { TouchableOpacity } from "react-native-gesture-handler";
import { Image, View } from "react-native";

import BottomNavigation_Client from "./components/BottomNavigation_Client";
import BottomNavigation_Admin from "./components/BottomNavigation_Admin";

const fontConfig = {
  default: {
    regular: {
      fontFamily: "sans-serif",
      fontWeight: "normal",
    },
    medium: {
      fontFamily: "sans-serif-medium",
      fontWeight: "normal",
    },
    light: {
      fontFamily: "sans-serif-light",
      fontWeight: "normal",
    },
    thin: {
      fontFamily: "sans-serif-thin",
      fontWeight: "normal",
    },
  },
};

const theme = {
  ...DefaultTheme,
  fonts: configureFonts(fontConfig),
  colors: {
    ...DefaultTheme.colors,
    primary: "black",
    text: "black",
  },
  roundness: 0,
};

theme.colors.secondaryContainer = "transparent";

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Home"
            component={BottomNavigation_Client}
            options={({ navigation }) => ({
              headerLeft: () => (
                <Image
                  style={{
                    width: 120,
                    height: 120,
                    resizeMode: "contain",
                    marginRight: 25,
                  }}
                  source={require("./assets/Logo2.png")}
                />
              ),
              headerStyle: {
                backgroundColor: "white",
                height: 110,
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              },
              headerTintColor: "black",
              headerRight: () => (
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("SavedRecipes")}
                  >
                    <Image
                      source={require("./assets/favorite-icon.png")}
                      style={{
                        width: 25,
                        height: 25,
                        marginRight: 20,
                      }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("NotificationsScreen")}
                  >
                    <Image
                      source={require("./assets/notification-icon.png")}
                      style={{
                        width: 25,
                        height: 25,
                        marginRight: 20,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              ),
              title: null,
            })}
          />
          <Stack.Screen
            name="PostRecipe"
            component={PostRecipeScreen}
            options={{
              title: "Create A Post",
              headerStyle: { backgroundColor: "white" },
              headerTintColor: "black",
            }}
          />
          <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
          <Stack.Screen
            name="CommentScreen"
            component={CommentScreen}
            options={{ headerTitle: "Comments" }}
          />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen
            name="SavedRecipes"
            component={SavedRecipesScreen}
            options={{ headerTitle: "Saved Recipes" }}
          />
          <Stack.Screen
            name="NotificationsScreen"
            component={NotificationScreen}
            options={{ headerTitle: "Notifications" }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ headerTitle: "Edit Profile" }}
          />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen
            name="VerificationRequestScreen"
            component={VerificationRequestScreen}
            options={{ headerTitle: "Verification" }}
          />
          <Stack.Screen name="ReportAccountScreen" component={ReportAccountScreen} options={{headerTitle: "Report Account"}}/>

          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UserProfile"
            component={BottomNavigation_Client}
          />

          <Stack.Screen
            name="Admin_Home"
            component={BottomNavigation_Admin}
            options={{
              headerLeft: () => (
                <Image
                  style={{
                    width: 120,
                    height: 120,
                    resizeMode: "contain",
                    marginRight: 25,
                  }}
                  source={require("./assets/Logo2.png")}
                />
              ),
              headerStyle: {
                backgroundColor: "white",
                height: 110,
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              },
              headerTintColor: "black",
              title: null,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="Admin_Report"
            component={BottomNavigation_Admin}
            options={{
              headerLeft: () => (
                <Image
                  style={{
                    width: 120,
                    height: 120,
                    resizeMode: "contain",
                    marginRight: 25,
                  }}
                  source={require("./assets/Logo2.png")}
                />
              ),
              headerStyle: {
                backgroundColor: "white",
                height: 110,
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              },
              headerTintColor: "black",
              title: null,
            }}
          />
          <Stack.Screen
            name="Admin_Verification"
            component={BottomNavigation_Admin}
            options={{
              headerLeft: () => (
                <Image
                  style={{
                    width: 120,
                    height: 120,
                    resizeMode: "contain",
                    marginRight: 25,
                  }}
                  source={require("./assets/Logo2.png")}
                />
              ),
              headerStyle: {
                backgroundColor: "white",
                height: 110,
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              },
              headerTintColor: "black",
              title: null,
            }}
          />

          <Stack.Screen name="Admin_ReportDetail" component={Admin_ReportDetail}/>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
