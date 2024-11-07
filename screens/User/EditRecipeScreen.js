import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Button, TextInput, RadioButton, Text } from "react-native-paper";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { storage } from "../../firebaseconfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const categories = [
  "Main Dish",
  "Side Dish",
  "Appetizers",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
];

export default function EditRecipeScreen({ route, navigation }) {
  const { recipeId } = route.params;
  const [recipeData, setRecipeData] = useState({
    recipeName: "",
    ingredients: [],
    instructions: "",
    difficulty: "medium",
    prepTime: "",
    serving: "",
    image: null,
    category: "",
    imageUrl: "",
  });
  const [newIngredient, setNewIngredient] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    const fetchRecipe = async () => {
      const firestore = getFirestore();
      const recipeDoc = await getDoc(doc(firestore, "post", recipeId));
      if (recipeDoc.exists()) {
        const data = recipeDoc.data();
        setRecipeData({
          ...data,
          ingredients: data.ingredients.split(", "),
          image: data.imageUrl,
        });
      }
    };
    fetchRecipe();
  }, [recipeId]);

  const handleInputChange = (name, value) => {
    setRecipeData((prev) => ({ ...prev, [name]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleInputChange("image", result.assets[0].uri);
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setRecipeData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()],
      }));
      setNewIngredient("");
    }
  };

  const uploadImage = async (uri, displayName) => {
    if (uri.startsWith("http")) return uri;

    const { uri: fileUri } = await FileSystem.getInfoAsync(uri);
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = (e) => reject(new TypeError("Network request failed"));
      xhr.responseType = "blob";
      xhr.open("GET", fileUri, true);
      xhr.send(null);
    });

    const filename = uri.substring(uri.lastIndexOf("/") + 1);
    const storageRef = ref(storage, `images/${displayName}/${filename}`);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  };

  const handleUpdateRecipe = async () => {
    try {
      const firestore = getFirestore();
      const recipeRef = doc(firestore, "post", recipeId);

      let imageUrl = recipeData.image;
      if (!imageUrl.startsWith("http")) {
        imageUrl = await uploadImage(recipeData.image, recipeData.displayName);
      }

      await updateDoc(recipeRef, {
        ...recipeData,
        ingredients: recipeData.ingredients.join(", "),
        imageUrl,
      });

      alert("Recipe Updated Successfully");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error updating recipe:", error);
      alert("Error updating recipe");
    }
  };

  const renderIngredientsSection = () => (
    <View>
      <Text className="text-lg font-bold mt-2.5 mb-1.25">Ingredients:</Text>

      <View className="mb-4">
        {recipeData.ingredients.map((ingredient, index) => (
          <View
            key={index}
            className="flex-row items-center bg-gray-100 p-2 mb-2 rounded"
          >
            <Text className="flex-1">{ingredient}</Text>
            <TouchableOpacity
              onPress={() => {
                setRecipeData((prevData) => ({
                  ...prevData,
                  ingredients: prevData.ingredients.filter(
                    (_, i) => i !== index
                  ),
                }));
              }}
              className="p-2"
            >
              <Text className="text-red-500">✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View className="flex-row items-center mb-2">
        <TextInput
          className="flex-1 mr-2"
          mode="outlined"
          value={newIngredient}
          onChangeText={setNewIngredient}
          placeholder="Enter an ingredient"
        />
        <TouchableOpacity onPress={addIngredient} className="bg-[#f2a586] p-3 ">
          <Text className="text-white text-xl">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white p-4">
        {step === 1 ? (
          <ScrollView>
            <Text className="text-lg font-bold mt-2.5 mb-1.25">
              Recipe Name:
            </Text>
            <TextInput
              mode="outlined"
              value={recipeData.recipeName}
              onChangeText={(text) => handleInputChange("recipeName", text)}
            />

            <Text className="text-lg font-bold mt-2.5 mb-2">Category:</Text>
            <View className="flex-row flex-wrap mb-4">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => handleInputChange("category", cat)}
                  className={`rounded-full px-4 py-2 m-1 ${
                    recipeData.category === cat ? "bg-[#f2a586]" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={
                      recipeData.category === cat
                        ? "text-white"
                        : "text-gray-700"
                    }
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-lg font-bold mt-2.5 mb-1.25">
              Difficulty:
            </Text>
            <RadioButton.Group
              onValueChange={(value) => handleInputChange("difficulty", value)}
              value={recipeData.difficulty}
            >
              <View className="flex-row justify-between mb-2.5">
                <RadioButton.Item label="Easy" value="Easy" />
                <RadioButton.Item label="Medium" value="Medium" />
                <RadioButton.Item label="Hard" value="Hard" />
              </View>
            </RadioButton.Group>
            <Text className="text-lg font-bold mt-2.5 mb-1.25">Serving:</Text>
            <TextInput
              className="mb-2.5"
              mode="outlined"
              value={recipeData.serving}
              onChangeText={(text) => handleInputChange("serving", text)}
              placeholder="e.g., 5 people"
            />
            <Text className="text-lg font-bold mt-2.5 mb-1.25">
              Preparation Time:
            </Text>
            <TextInput
              className="mb-2.5"
              mode="outlined"
              value={recipeData.prepTime}
              onChangeText={(text) => handleInputChange("prepTime", text)}
              placeholder="e.g., 30 minutes"
            />

            {renderIngredientsSection()}

            <Text className="text-lg font-bold mt-2.5 mb-1.25">
              Instructions:
            </Text>
            <TextInput
              className="mb-2.5 py-3"
              mode="outlined"
              multiline
              numberOfLines={8}
              value={recipeData.instructions}
              onChangeText={(text) => handleInputChange("instructions", text)}
            />
            <View className="mt-2"></View>
            <Button
              mode="contained"
              className="bg-[#f2a586] mt-4"
              onPress={() => setStep(2)}
            >
              Next
            </Button>
          </ScrollView>
        ) : (
          <ScrollView className="p-4">
            <TouchableOpacity onPress={pickImage} className="mb-4 items-center">
              {recipeData.image ? (
                <Image
                  source={{ uri: recipeData.image }}
                  className="w-full h-52 rounded-lg"
                />
              ) : (
                <View className="border-2 border-gray-300 border-dashed rounded-lg p-4">
                  <Text>Tap to Upload Image</Text>
                </View>
              )}
            </TouchableOpacity>

            <Button
              mode="contained"
              className="bg-[#f2a586]"
              onPress={handleUpdateRecipe}
            >
              Update Recipe
            </Button>

            <Button mode="outlined" className="mt-4" onPress={() => setStep(1)}>
              Back
            </Button>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
