import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button, TextInput, RadioButton, Text } from "react-native-paper";
import { getAuth } from "firebase/auth";
import { collection, addDoc, getFirestore } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { storage } from "../../firebaseconfig";

const categories = [
  "Main Dish",
  "Side Dish",
  "Appetizers",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
];

export default function PostRecipeScreen({ navigation }) {
  const [recipeData, setRecipeData] = useState({
    recipeName: "",
    ingredients: [],
    instructions: "",
    difficulty: "medium",
    prepTime: "",
    serving: "",
    image: null,
    category: "",
  });
  const [step, setStep] = useState(1);

  const handleInputChange = (name, value) => {
    setRecipeData((prevData) => ({ ...prevData, [name]: value }));
  };

  const [newIngredient, setNewIngredient] = useState(""); // New state for single ingredient input

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
      setRecipeData((prevData) => ({
        ...prevData,
        ingredients: [...prevData.ingredients, newIngredient.trim()],
      }));
      setNewIngredient(""); // Clear the input
    }
  };

  const handlePostAction = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("User not logged in");
      return;
    }

    try {
      const imageUrl = await uploadImage(recipeData.image, user.displayName);
      const firestore = getFirestore();
      const recipeCollection = collection(firestore, "post");
      await addDoc(recipeCollection, {
        userId: user.uid,
        displayName: user.displayName,
        ...recipeData,
        ingredients: recipeData.ingredients.join(", "), // Convert array to comma-separated string
        imageUrl,
      });
      alert("Recipe Posted");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error Posting Recipe", error);
      alert("Error Posting Recipe");
    }
  };

  const uploadImage = async (uri, displayName) => {
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

  const renderStep1 = () => (
    <ScrollView>
      <Text className="text-lg font-bold mt-2.5 mb-1.25">Recipe Name:</Text>
      <TextInput
        className="mb-2.5"
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
              className={`text-sm ${
                recipeData.category === cat ? "text-white" : "text-gray-700"
              }`}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text className="text-lg font-bold mt-2.5 mb-1.25">Difficulty:</Text>
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

      <Text className="text-lg font-bold mt-2.5 mb-1.25">Instructions:</Text>
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
        className="bg-[#f2a586]"
        onPress={() => setStep(2)}
      >
        Next
      </Button>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView className="p-4">
      <TouchableOpacity onPress={pickImage} className="mb-4 items-center">
        {recipeData.image ? (
          <Image
            source={{ uri: recipeData.image }}
            className="w-full h-52 rounded-lg"
          />
        ) : (
          <View className="border-2 border-gray-300 border-dashed rounded-lg h-80 w-72">
            <Text className="text-gray-500 text-lg text-center mt-36">
              Tap to Upload Image
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <View className="m-2.5"></View>
      <Button
        mode="contained"
        className="bg-[#f2a586]"
        onPress={handlePostAction}
      >
        Post
      </Button>
      <View className="m-2.5"></View>
      <Button mode="outlined" color="black" onPress={() => setStep(1)}>
        Back to Recipe Details
      </Button>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white p-4">
        {step === 1 ? renderStep1() : renderStep2()}
      </View>
    </SafeAreaView>
  );
}
