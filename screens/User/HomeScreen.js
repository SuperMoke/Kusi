// HomeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { Text, Menu } from "react-native-paper";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../firebaseconfig"; // Adjust the path as necessary

export default function HomeScreen() {
  const [recipes, setRecipes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [likedRecipes, setLikedRecipes] = useState({});
  const [savedRecipes, setSavedRecipes] = useState({});
  const [followedAccounts, setFollowedAccounts] = useState([]); // Store followed accounts
  const [menuVisible, setMenuVisible] = useState({});

  const navigation = useNavigation();

  useEffect(() => {
    const fetchRecipesAndAuthors = async () => {
      try {
        const firestore = getFirestore();
        const recipeCollection = collection(firestore, "post");
        const usersCollection = collection(firestore, "users");

        const recipeQuerySnapshot = await getDocs(recipeCollection);
        const recipesData = recipeQuerySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          likes: doc.data().likes || 0, // Initialize likes to 0 if it doesn't exist
          saved: doc.data().saved || false, // Initialize saved to false if it doesn't exist
        }));

        const updatedRecipes = await Promise.all(
          recipesData.map(async (recipe) => {
            const { displayName } = recipe;
            const authorQuerySnapshot = await getDocs(
              query(usersCollection, where("name", "==", displayName))
            );
            const authorData = authorQuerySnapshot.docs.map((doc) => ({
              displayName: doc.data().displayName,
              profilePicture: doc.data().imageUrl,
            }));

            return { ...recipe, authorData: authorData[0] };
          })
        );

        // Sort recipes based on the algorithm
        const sortedRecipes = updatedRecipes.sort((a, b) => {
          // Higher priority for followed accounts
          const aIsFollowed = followedAccounts.includes(
            a.authorData?.displayName
          );
          const bIsFollowed = followedAccounts.includes(
            b.authorData?.displayName
          );
          if (aIsFollowed && !bIsFollowed) return -1;
          if (!aIsFollowed && bIsFollowed) return 1;

          // Higher priority for higher likes
          const aLikesCount = a.likes.length;
          const bLikesCount = b.likes.length;
          if (aLikesCount > bLikesCount) return -1;
          if (aLikesCount < bLikesCount) return 1;

          // Newer posts first
          return b.createdAt - a.createdAt;
        });

        setRecipes(sortedRecipes);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setRefreshing(false);
      }
    };

    const fetchUserPreferences = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const firestore = getFirestore();
      const userSavedPostsRef = doc(firestore, "userSavedPosts", user.uid);
      const userSavedPostsDoc = await getDoc(userSavedPostsRef);

      if (userSavedPostsDoc.exists()) {
        const savedPostIds = userSavedPostsDoc.data().savedPostIds || [];
        const savedRecipesObj = savedPostIds.reduce((acc, id) => {
          acc[id] = true;
          return acc;
        }, {});
        setSavedRecipes(savedRecipesObj);
      }

      const likedPostsQuery = query(
        collection(firestore, "post"),
        where("likes", "array-contains", user.uid)
      );
      const likedPostsSnapshot = await getDocs(likedPostsQuery);
      const likedRecipesObj = likedPostsSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = true;
        return acc;
      }, {});
      setLikedRecipes(likedRecipesObj);
    };

    fetchUserPreferences();

    const unsubscribe = onSnapshot(collection(getFirestore(), "post"), () =>
      fetchRecipesAndAuthors()
    );

    return () => unsubscribe();
  }, [followedAccounts]); // Re-fetch when followed accounts change

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecipesAndAuthors();
  };

  const createNotification = async (type, recipeId, recipeOwnerId) => {
    const firestore = getFirestore();
    const user = auth.currentUser;
    if (!user) return;

    // Query to find the user document based on the UID
    const userQuery = query(
      collection(firestore, "users"),
      where("uid", "==", user.uid)
    );
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      console.error("User document not found");
      return;
    }

    const userData = userSnapshot.docs[0].data();

    const notificationRef = collection(firestore, "notifications");

    await addDoc(notificationRef, {
      type,
      senderId: user.uid,
      senderName: userData.name || "Anonymous",
      senderAvatar: userData.imageUrl || null,
      recipientId: recipeOwnerId,
      recipeId,
      createdAt: serverTimestamp(),
    });
  };

  const toggleLike = async (recipeId) => {
    const firestore = getFirestore();
    const recipeRef = doc(firestore, "post", recipeId);
    const user = auth.currentUser;

    if (!user) {
      console.error("User not authenticated");
      return;
    }

    if (!likedRecipes[recipeId]) {
      // Only create a notification when the user likes the post
      const recipeDoc = await getDoc(doc(firestore, "post", recipeId));
      const recipeData = recipeDoc.data();
      if (recipeData.userId !== user.uid) {
        createNotification("like", recipeId, recipeData.userId);
      }
    }

    setRecipes((prevRecipes) =>
      prevRecipes.map((recipe) => {
        if (recipe.id === recipeId) {
          const isLiked = !likedRecipes[recipeId];
          setLikedRecipes((prevLikedRecipes) => ({
            ...prevLikedRecipes,
            [recipeId]: isLiked,
          }));

          const newLikes = isLiked
            ? arrayUnion(user.uid)
            : arrayRemove(user.uid);

          updateDoc(recipeRef, {
            likes: newLikes,
          });

          return {
            ...recipe,
            likes: newLikes,
          };
        }
        return recipe;
      })
    );
  };

  const toggleSave = async (recipeId) => {
    const firestore = getFirestore();
    const recipeRef = doc(firestore, "post", recipeId);
    const user = auth.currentUser;

    if (!user) {
      console.error("User not authenticated");
      return;
    }

    const userSavedPostsRef = doc(firestore, "userSavedPosts", user.uid);

    try {
      // Check if the document exists
      const userSavedPostsDoc = await getDoc(userSavedPostsRef);

      if (!userSavedPostsDoc.exists()) {
        // If the document doesn't exist, create it with an initial array
        await setDoc(userSavedPostsRef, { savedPostIds: [] });
      }

      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) => {
          if (recipe.id === recipeId) {
            const isSaved = !savedRecipes[recipeId];
            setSavedRecipes((prevSavedRecipes) => ({
              ...prevSavedRecipes,
              [recipeId]: isSaved,
            }));

            updateDoc(recipeRef, {
              saved: isSaved,
            });

            // Update user-specific saved posts collection
            updateDoc(userSavedPostsRef, {
              savedPostIds: isSaved
                ? arrayUnion(recipeId)
                : arrayRemove(recipeId),
            });

            return {
              ...recipe,
              saved: isSaved,
            };
          }
          return recipe;
        })
      );
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const handleMenuPress = (recipeId) => {
    setMenuVisible((prev) => ({
      ...prev,
      [recipeId]: !prev[recipeId],
    }));
  };

  const handleMenuClose = (recipeId) => {
    setMenuVisible((prev) => ({
      ...prev,
      [recipeId]: false,
    }));
  };

  const handleMenuAction = (action, recipeId, recipeOwnerName) => {
    switch (action) {
      case "report":
        console.log("Report recipe", recipeId);
        navigation.navigate("ReportPostScreen", {
          reportedPostId: recipeId,
          reportedUserName: recipeOwnerName,
        });
        break;
      case "edit":
        console.log("Edit recipe", recipeId);
        // Navigate to edit screen
        break;
      case "delete":
        console.log("Delete recipe", recipeId);
        // Implement delete functionality
        break;
    }
    handleMenuClose(recipeId);
  };

  const renderRecipeItem = ({ item }) => {
    const user = auth.currentUser;

    // Check if the post belongs to the current user
    const isCurrentUserPost = user && item.userId === user.uid;

    return (
      <View className="border-b border-gray-200 mb-4">
        <View className="flex-row items-center p-4">
          <TouchableOpacity
            className="flex-row items-center"
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
          <Menu
            visible={menuVisible[item.id] || false}
            onDismiss={() => handleMenuClose(item.id)}
            anchor={
              <TouchableOpacity onPress={() => handleMenuPress(item.id)}>
                <Image
                  source={require("../../assets/three-dot-icon.png")}
                  className="h-5 w-5 ml-24"
                />
              </TouchableOpacity>
            }
          >
            {!isCurrentUserPost && (
              <Menu.Item
                onPress={() =>
                  handleMenuAction("report", item.id, item.displayName)
                }
                title="Report"
              />
            )}
            <Menu.Item
              onPress={() => handleMenuAction("edit", item.id)}
              title="Edit"
            />
            <Menu.Item
              onPress={() => handleMenuAction("delete", item.id)}
              title="Delete"
            />
          </Menu>
        </View>
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
            onPress={() =>
              navigation.navigate("RecipeDetail", { recipe: item })
            }
          >
            <Text className="text-gray-500 text-sm">See full recipe</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-around pb-4">
          <TouchableOpacity
            className="flex-row items-center p-2"
            onPress={() => toggleLike(item.id)}
          >
            <Image
              className="w-5 h-5 mr-1"
              source={
                likedRecipes[item.id]
                  ? require("../../assets/heart-icon-filled.png")
                  : require("../../assets/heart-icon.png")
              }
            />
            <Text className="text-gray-700 text-sm">
              {item.likes?.length || 0} likes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center p-2"
            onPress={() =>
              navigation.navigate("CommentScreen", {
                recipeId: item.id,
                recipeName: item.recipeName,
                authorAvatar:
                  item.authorData?.profilePicture ||
                  require("../../assets/Avatar.png"),
                authorName: item.authorData?.displayName || item.displayName,
              })
            }
          >
            <Image
              className="w-5 h-5 mr-1"
              source={require("../../assets/comment-icon.png")}
            />
            <Text className="text-gray-700 text-sm">
              {item.comments?.length || 0} comments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center p-2"
            onPress={() => toggleSave(item.id)}
          >
            <Image
              className="w-5 h-5"
              source={
                savedRecipes[item.id]
                  ? require("../../assets/favorite-icon-filled.png")
                  : require("../../assets/favorite-icon.png")
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
