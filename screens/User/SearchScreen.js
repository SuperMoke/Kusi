// SearchScreen.js
import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { Text } from "react-native-paper";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import Fuse from "fuse.js";

export default function SearchScreen({ route }) {
  const [searchQuery, setSearchQuery] = useState(
    route.params?.searchQuery || ""
  );
  const [searchResults, setSearchResults] = useState([]);
  const [allData, setAllData] = useState([]);
  const navigation = useNavigation();

  const onChangeSearch = (query) => {
    setSearchQuery(query);
  };

  const fetchAllData = async () => {
    const firestore = getFirestore();
    const results = [];

    // Fetch all recipes
    const recipesRef = collection(firestore, "post");
    const recipeSnapshot = await getDocs(recipesRef);
    recipeSnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data(), type: "recipe" });
    });

    // Fetch all users
    const usersRef = collection(firestore, "users");
    const userSnapshot = await getDocs(usersRef);
    userSnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data(), type: "user" });
    });

    setAllData(results);
  };

  const performSearch = () => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const searchTerms = searchQuery
      .split(/[,\s]+/)
      .map((term) => term.trim().toLowerCase())
      .filter((term) => term.length > 0);

    const fuse = new Fuse(allData, {
      keys: [
        "recipeName",
        "name",
        "ingredients.name", // Search through ingredient names
        "ingredients", // Keep the original ingredients search
      ],
      includeScore: true,
      threshold: 0.4,
      useExtendedSearch: true, // Enable extended search
      ignoreLocation: true, // Ignore where the match occurs in the string
      shouldSort: true,
      findAllMatches: true, // Find all matching items
    });

    // Perform individual searches for each term and combine results
    const results = searchTerms.reduce((acc, term) => {
      const termResults = fuse.search(term);
      return [...acc, ...termResults];
    }, []);

    // Remove duplicates and sort by score
    const uniqueResults = Array.from(
      new Set(results.map((result) => result.item.id))
    ).map((id) => results.find((result) => result.item.id === id).item);

    setSearchResults(uniqueResults);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, allData]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TextInput
          className="flex-1 ml-2"
          placeholder="Search Recipe/Users/Ingredients"
          onChangeText={onChangeSearch}
          value={searchQuery}
        />
      ),
    });
  }, [navigation, searchQuery]);

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-200"
      onPress={() => {
        if (item.type === "recipe") {
          navigation.navigate("RecipeDetail", { recipe: item });
        } else if (item.type === "user") {
          // Navigate to user profile (you'll need to implement this screen)
          navigation.navigate("ProfileScreen", {
            userId: item.id,
            displayName: item.name,
          });
        }
      }}
    >
      <Image
        className="w-10 h-10 mr-3"
        source={
          item.type === "recipe"
            ? item.imageUrl
              ? { uri: item.imageUrl }
              : require("../../assets/default-recipe.png")
            : item.image
            ? { uri: item.image }
            : require("../../assets/Avatar.png")
        }
      />

      <View className="flex-1">
        <Text className="font-bold">
          {item.type === "recipe" ? item.recipeName : item.name}
        </Text>
        <Text className="text-gray-500">
          {item.type === "recipe" ? "Recipe" : "User"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={searchResults}
        renderItem={renderSearchItem}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 py-4">
            {searchQuery ? "No results found." : "Start typing to search."}
          </Text>
        }
      />
    </View>
  );
}
