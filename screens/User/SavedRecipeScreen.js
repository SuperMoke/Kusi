// SavedRecipesScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { Text } from "react-native-paper";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../firebaseconfig"; // Adjust the path as necessary

export default function SavedRecipesScreen() {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const firestore = getFirestore();
        const user = auth.currentUser;

        if (!user) {
          console.error("User not authenticated");
          return;
        }

        const userSavedPostsRef = doc(firestore, "userSavedPosts", user.uid);
        const userSavedPostsDoc = await getDoc(userSavedPostsRef);

        if (!userSavedPostsDoc.exists()) {
          setSavedRecipes([]);
          return;
        }

        const savedPostIds = userSavedPostsDoc.data().savedPostIds || [];
        const recipeCollection = collection(firestore, "post");

        const savedRecipesData = await Promise.all(
          savedPostIds.map(async (recipeId) => {
            const recipeDoc = await getDoc(doc(recipeCollection, recipeId));
            if (recipeDoc.exists()) {
              return { id: recipeDoc.id, ...recipeDoc.data() };
            }
            return null;
          })
        );

        const filteredSavedRecipes = savedRecipesData.filter(
          (recipe) => recipe !== null
        );

        setSavedRecipes(filteredSavedRecipes);
      } catch (error) {
        console.error("Error fetching saved recipes: ", error);
      } finally {
        setRefreshing(false);
      }
    };

    fetchSavedRecipes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSavedRecipes();
  };

  const renderRecipeItem = ({ item }) => (
    <View className="border-b border-gray-200 mb-4">
      <TouchableOpacity
        className="flex-row items-center p-4"
        onPress={() =>
          navigation.navigate("ProfileScreen", {
            userId: item.userId,
            displayName: item.displayName,
          })
        }
      >
        <Image
          className="w-10 h-10 rounded-full mr-3"
          source={
            item.authorData?.profilePicture
              ? { uri: item.authorData.profilePicture }
              : require("../../assets/Avatar.png")
          }
        />
        <Text className="font-bold text-base">
          {item.authorData?.displayName || item.displayName}
        </Text>
      </TouchableOpacity>
      <Image
        className="w-full h-80"
        source={{ uri: item.imageUrl }}
        onError={(error) =>
          console.error("Error loading image:", error.nativeEvent.error)
        }
      />
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-col items-center border border-gray-200 rounded-md px-4 py-2 w-1/3">
            <Image
              source={require("../../assets/difficulty-icon.png")}
              className="h-5 w-5 mb-1"
            />
            <Text className="text-gray-500 text-sm font-bold">
              {item.difficulty}
            </Text>
            <Text className="text-gray-500 text-xs">Difficulty</Text>
          </View>
          <View className="flex-col items-center border border-gray-200 rounded-md px-4 py-2 w-1/3">
            <Image
              source={require("../../assets/time-icon.png")}
              className="h-5 w-5 mb-1"
            />
            <Text className="text-gray-500 text-sm font-bold">
              {item.prepTime}
            </Text>
            <Text className="text-gray-500 text-xs">Cooking Time</Text>
          </View>
          <View className="flex-col items-center border border-gray-200 rounded-md px-4 py-2 w-1/3">
            <Image
              source={require("../../assets/meal-icon.png")}
              className="h-5 w-5 mb-1"
            />
            <Text className="text-gray-500 text-sm font-bold">
              {item.category}
            </Text>
            <Text className="text-gray-500 text-xs">Category</Text>
          </View>
        </View>
        <Text className="font-bold text-lg mb-2">{item.recipeName}</Text>

        <Text className="text-gray-700 text-sm mb-2">
          {item.ingredients.split(",")[0]}...
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
        >
          <Text className="text-gray-500 text-sm">See full recipe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={savedRecipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}