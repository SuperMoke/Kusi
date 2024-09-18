// RecipeDetailScreen.js
import React from "react";
import { View,  Image, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function RecipeDetailScreen({ route }) {
  const { recipe } = route.params;
  const navigation = useNavigation();

  navigation.setOptions({
      title: recipe.recipeName,
    });

  // Function to split and trim ingredients
  const splitIngredients = (ingredients) => {
    return ingredients
      .split('\n')
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0); // Filter out any empty strings
  };

  // Function to split and trim instructions
  const splitInstructions = (instructions) => {
    return instructions
      .split('\n')
      .map(instruction => instruction.trim())
      .filter(instruction => instruction.length > 0); // Filter out any empty strings
  };

  
  const memoizedIngredients = React.useMemo(() => splitIngredients(recipe.ingredients), [recipe.ingredients]);
  const memoizedInstructions = React.useMemo(() => splitInstructions(recipe.instructions), [recipe.instructions]);

  return (
    <View className="flex-1 bg-white p-4">
    <ScrollView >
      <Image
        className="w-full h-80 mb-4"
        source={{ uri: recipe.imageUrl }}
        onError={(error) =>
          console.error("Error loading image:", error.nativeEvent.error)
        }
      />
      <View className="flex-row items-center justify-between mb-2">
          <View className="flex-col items-center border border-gray-200 rounded-md px-4 py-2 w-1/3">
            <Image
              source={require("../../assets/difficulty-icon.png")}
              className="h-5 w-5 mb-1"
            />
            <Text className="text-gray-500 text-sm font-bold">
              {recipe.difficulty}
            </Text>
            <Text className="text-gray-500 text-xs">Difficulty</Text>
          </View>
          <View className="flex-col items-center border border-gray-200 rounded-md px-4 py-2 w-1/3">
            <Image
              source={require("../../assets/time-icon.png")}
              className="h-5 w-5 mb-1"
            />
            <Text className="text-gray-500 text-sm font-bold">
              {recipe.prepTime}
            </Text>
            <Text className="text-gray-500 text-xs">Cooking Time</Text>
          </View>
          <View className="flex-col items-center border border-gray-200 rounded-md px-4 py-2 w-1/3">
            <Image
              source={require("../../assets/meal-icon.png")}
              className="h-5 w-5 mb-1"
            />
            <Text className="text-gray-500 text-sm font-bold">
              {recipe.category}
            </Text>
            <Text className="text-gray-500 text-xs">Category</Text>
          </View>
        </View>
      <Text className="font-bold text-xl mb-2">Ingredients:</Text>
      {memoizedIngredients.map((ingredient, index) => (
        <Text key={index} className="mb-1">- {ingredient}</Text>
      ))}
      <Text className="font-bold text-xl mb-2">Instructions:</Text>
      {memoizedInstructions.map((instruction, index) => (
        <Text key={index} className="mb-1">- {instruction}</Text>
      ))}
    </ScrollView>
    </View>
  );
}