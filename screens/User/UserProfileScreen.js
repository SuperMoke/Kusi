import React, { useState, useEffect } from "react";
import { View, Image, FlatList, TouchableOpacity, Alert } from "react-native";
import { Text } from "react-native-paper";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

export default function UserProfileScreen() {
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const navigation = useNavigation();
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      title: "My Profile",
    });

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchCurrentUserEmail();
        await fetchUserProfile();
        await fetchUserPosts();
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while fetching data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchCurrentUserEmail = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setCurrentUserEmail(user.email);
    }
  };

  const fetchUserProfile = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setError("User not authenticated");
      return;
    }

    const firestore = getFirestore();
    const usersCollection = collection(firestore, "users");
    const userQuery = query(usersCollection, where("email", "==", user.email));
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      const userWithId = { id: userDoc.id, ...userData };
      console.log("Fetched user data:", userWithId); // Log fetched user data
      setUserProfile(userWithId);
      setFollowersCount(userData.followers?.length || 0);
      setFollowingCount(userData.following?.length || 0);
    } else {
      console.log("No user found with email:", user.email);
      setError("User not found");
    }
  };

  const fetchUserPosts = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setError("User not authenticated");
      return;
    }

    const firestore = getFirestore();
    const postsCollection = collection(firestore, "post");
    const postsQuery = query(postsCollection, where("userId", "==", user.uid));
    const postsSnapshot = await getDocs(postsQuery);
    setUserPosts(
      postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  };

  const renderPostItem = ({ item }) => (
    <TouchableOpacity
      className="w-1/3 aspect-square p-1"
      onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
    >
      <Image source={{ uri: item.imageUrl }} className="w-full h-full" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>{error}</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>User not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row items-center mb-4">
          <Image
            source={
              userProfile.imageUrl
                ? { uri: userProfile.imageUrl }
                : require("../../assets/Avatar.png")
            }
            className="w-20 h-20 rounded-full mr-4"
          />
          <View>
            <Text className="font-bold text-xl">{userProfile.name}</Text>
            <Text className="text-gray-600">
              {userProfile.bio || "No bio available"}
            </Text>
            <View className="flex-row items-center justify-center">
  {userProfile.userTitle && (
    <>
      <Text className="text-gray-600">
        Verified by KUSI : {userProfile.userTitle}
      </Text>
      <Image
        source={require('../../assets/kusi-verified-icon.png')}
        className="w-6 h-6 ml-1"
      />
    </>
  )}
</View>
          </View>
        </View>
        <View className="flex-row justify-around mb-4">
          <View className="items-center">
            <Text className="font-bold">{userPosts.length}</Text>
            <Text className="text-gray-600">Posts</Text>
          </View>
          <View className="items-center">
            <Text className="font-bold">{followersCount}</Text>
            <Text className="text-gray-600">Followers</Text>
          </View>
          <View className="items-center">
            <Text className="font-bold">{followingCount}</Text>
            <Text className="text-gray-600">Following</Text>
          </View>
        </View>
        <TouchableOpacity
          className="bg-[#f2a586] p-2 rounded-lg items-center"
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text className="text-white font-bold">Edit Profile</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={userPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 py-4">No post yet.</Text>
        }
      />
    </View>
  );
}
