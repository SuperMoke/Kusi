// Admin_Report_DetailScreen.js
import React, { useEffect, useState } from "react";
import { View, ScrollView, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { Button, Text } from "react-native-paper";
import { Alert } from "react-native";

export default function Admin_ReportDetail({ route }) {
  const { report } = route.params;
  const navigation = useNavigation();
  const [post, setPost] = useState(null);
  const [reporterName, setReporterName] = useState(null);

  navigation.setOptions({
    title: `Report for ${report.reportedUserName}`,
  });

  useEffect(() => {
    if (report.reportedPostId) {
      fetchPostData(report.reportedPostId);
    }
    if (report.reportingUserId) {
      fetchReporterName(report.reportingUserId);
    }
  }, [report.reportedPostId, report.reportingUserId]);

  const fetchPostData = async (postId) => {
    const firestore = getFirestore();
    const postDoc = doc(firestore, "post", postId);
    const postSnapshot = await getDoc(postDoc);
    if (postSnapshot.exists()) {
      setPost(postSnapshot.data());
    } else {
      console.error("No such post!");
    }
  };

  const fetchReporterName = async (userId) => {
    const firestore = getFirestore();
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("uid", "==", userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      setReporterName(userDoc.data().name);
    } else {
      console.error("No such user or uid mismatch!");
    }
  };

  const splitIngredients = (ingredients) => {
    return ingredients
      .split("\n")
      .map((ingredient) => ingredient.trim())
      .filter((ingredient) => ingredient.length > 0); // Filter out any empty strings
  };

  const splitInstructions = (instructions) => {
    return instructions
      .split("\n")
      .map((instruction) => instruction.trim())
      .filter((instruction) => instruction.length > 0); // Filter out any empty strings
  };

  const memoizedIngredients = React.useMemo(
    () => (post ? splitIngredients(post.ingredients) : []),
    [post]
  );
  const memoizedInstructions = React.useMemo(
    () => (post ? splitInstructions(post.instructions) : []),
    [post]
  );

  const handleDeletePost = async () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post and associated reports?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            const firestore = getFirestore();
            
            try {
              // Delete the post
              await deleteDoc(doc(firestore, "post", report.reportedPostId));

              // Delete all reports associated with this post
              const reportsRef = collection(firestore, "reports");
              const q = query(reportsRef, where("reportedPostId", "==", report.reportedPostId));
              const querySnapshot = await getDocs(q);
              
              const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
              await Promise.all(deletePromises);

              Alert.alert("Success", "Post and associated reports have been deleted.");
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting post and reports:", error);
              Alert.alert("Error", "Failed to delete post and reports. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-white ">
      <ScrollView>
        <View className="bg-white rounded-lg shadow-lg overflow-hidden p-4">
          <Text className="text-xl font-bold mb-2">Reported Details</Text>
          <Text className="text-gray-600 mb-2">Reason: {report.reason}</Text>
          <Text className="text-gray-600 mb-2">Details: {report.details}</Text>
          <Text className="text-gray-600 mb-2">Status: {report.status}</Text>
          {reporterName && (
            <Text className="text-gray-600 mb-2">
              Reported By: {reporterName}
            </Text>
          )}
          {report.createdAt && (
            <Text className="text-gray-600 mb-2">
              Reported At:{" "}
              {new Date(report.createdAt.toDate()).toLocaleString()}
            </Text>
          )}
          {report.imageUrl && (
            <Image
              source={{ uri: report.imageUrl }}
              className="w-full h-64 rounded-lg mt-4"
            />
          )}

          {/* Display Post Data */}
          {post && (
            <View className="mt-4">
              <Text className="text-xl font-bold mb-2">Reported Post</Text>
              <Image
                className="w-full h-80 mb-4"
                source={{ uri: post.imageUrl }}
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
                    {post.difficulty}
                  </Text>
                  <Text className="text-gray-500 text-xs">Difficulty</Text>
                </View>
                <View className="flex-col items-center border border-gray-200 rounded-md px-4 py-2 w-1/3">
                  <Image
                    source={require("../../assets/time-icon.png")}
                    className="h-5 w-5 mb-1"
                  />
                  <Text className="text-gray-500 text-sm font-bold">
                    {post.prepTime}
                  </Text>
                  <Text className="text-gray-500 text-xs">Cooking Time</Text>
                </View>
                <View className="flex-col items-center border border-gray-200 rounded-md px-4 py-2 w-1/3">
                  <Image
                    source={require("../../assets/meal-icon.png")}
                    className="h-5 w-5 mb-1"
                  />
                  <Text className="text-gray-500 text-sm font-bold">
                    {post.category}
                  </Text>
                  <Text className="text-gray-500 text-xs">Category</Text>
                </View>
              </View>
              <Text className="font-bold text-xl mb-2">Ingredients:</Text>
              {memoizedIngredients.map((ingredient, index) => (
                <Text key={index} className="mb-1">
                  - {ingredient}
                </Text>
              ))}
              <Text className="font-bold text-xl mb-2">Instructions:</Text>
              {memoizedInstructions.map((instruction, index) => (
                <Text key={index} className="mb-1">
                  - {instruction}
                </Text>
              ))}
            </View>
          )}
          <TouchableOpacity className="bg-[#f2a586] p-3 rounded-md items-center"onPress={handleDeletePost}>
            <Text className="text-white font-bold">Delete Post</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
