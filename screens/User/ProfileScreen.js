import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
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
  getDoc,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

export default function ProfileScreen({ route }) {
  const { userId, displayName } = route.params;
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const navigation = useNavigation();
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // State for refresh control
  const [showChatButton, setShowChatButton] = useState(false); // New state for chat button visibility

  useEffect(() => {
    navigation.setOptions({
      title: displayName,
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
  }, [displayName]);

  const fetchCurrentUserEmail = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setCurrentUserEmail(user.email);
    }
  };

  const fetchUserProfile = async () => {
    const firestore = getFirestore();
    const usersCollection = collection(firestore, "users");
    const userQuery = query(usersCollection, where("name", "==", displayName));
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      const userWithId = { id: userDoc.id, ...userData };
      console.log("Fetched user data:", userWithId); // Log fetched user data
      setUserProfile(userWithId);
      setFollowersCount(userData.followers?.length || 0);
      setFollowingCount(userData.following?.length || 0);

      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser && Array.isArray(userData.followers)) {
        const isFollowingUser = userData.followers.includes(currentUser.uid);
        setIsFollowing(isFollowingUser);
        setShowChatButton(isFollowingUser); // Set chat button visibility based on follow status
      } else {
        setIsFollowing(false);
        setShowChatButton(false); // Ensure chat button is hidden if not following
      }
    } else {
      console.log("No user found with name:", displayName);
      setError("User not found");
    }
  };

  const fetchUserPosts = async () => {
    const firestore = getFirestore();
    const postsCollection = collection(firestore, "post");
    const postsQuery = query(
      postsCollection,
      where("displayName", "==", displayName)
    );
    const postsSnapshot = await getDocs(postsQuery);
    setUserPosts(
      postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  };

  const handleFollowUnfollow = async () => {
    const firestore = getFirestore();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to follow/unfollow.");
      return;
    }

    const currentUserUid = currentUser.uid;
    const userDocRef = doc(firestore, "users", userProfile.id);

    try {
      // Fetch the current user's document to get the document ID
      const currentUserQuery = query(
        collection(firestore, "users"),
        where("uid", "==", currentUserUid)
      );
      const currentUserSnapshot = await getDocs(currentUserQuery);

      if (currentUserSnapshot.empty) {
        Alert.alert("Error", "Current user not found.");
        return;
      }

      const currentUserDoc = currentUserSnapshot.docs[0];
      const currentUserDocRef = doc(firestore, "users", currentUserDoc.id);

      if (isFollowing) {
        // Unfollow
        await updateDoc(userDocRef, {
          followers: arrayRemove(currentUserUid),
        });
        await updateDoc(currentUserDocRef, {
          following: arrayRemove(userProfile.id),
        });
        setIsFollowing(false);
        setShowChatButton(false); // Hide chat button when unfollowing
        setFollowersCount((prevCount) => prevCount - 1);
      } else {
        // Follow
        await updateDoc(userDocRef, {
          followers: arrayUnion(currentUserUid),
        });
        await updateDoc(currentUserDocRef, {
          following: arrayUnion(userProfile.id),
        });
        setIsFollowing(true);
        setShowChatButton(true); // Show chat button when following
        setFollowersCount((prevCount) => prevCount + 1);
      }
    } catch (error) {
      console.error("Error updating follow/unfollow status:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserProfile();
      await fetchUserPosts();
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("An error occurred while refreshing data. Please try again.");
    } finally {
      setRefreshing(false);
    }
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
                    source={require("../../assets/kusi-verified-icon.png")}
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
        {currentUserEmail === userProfile.email ? (
          <TouchableOpacity
            className="bg-[#f2a586] p-2 rounded-lg items-center"
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text className="text-white font-bold">Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row justify-around mb-4 ">
            <TouchableOpacity
              className="bg-[#f2a586]  rounded-lg items-center px-14 py-2 m-1"
              onPress={handleFollowUnfollow}
            >
              <Text className="text-white font-bold">
                {isFollowing ? "Unfollow" : "Follow"}
              </Text>
            </TouchableOpacity>
            {showChatButton && (
              <TouchableOpacity
                className="bg-[#f2a586]  rounded-lg items-center px-14 py-2 m-1"
                onPress={() =>
                  navigation.navigate("ChatScreen", {
                    userId: userProfile.uid,
                    displayName: userProfile.name,
                  })
                }
              >
                <Text className="text-white font-bold">Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {currentUserEmail !== userProfile.email && (
          <TouchableOpacity
            className="bg-red-500 rounded-lg items-center px-14 py-2 m-1"
            onPress={() =>
              navigation.navigate("ReportAccountScreen", {
                reportedUserName: userProfile.name,
              })
            }
          >
            <Text className="text-white font-bold">Report Account</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={userPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
