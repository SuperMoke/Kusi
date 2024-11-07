import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Text, Button, Avatar, IconButton } from "react-native-paper";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function CommentScreen({ route }) {
  const { recipeId, recipeName, authorAvatar, authorName } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [editingComment, setEditingComment] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      const firestore = getFirestore();
      const recipeRef = doc(firestore, "post", recipeId);
      const recipeSnap = await getDoc(recipeRef);

      if (recipeSnap.exists()) {
        const commentsData = recipeSnap.data().comments || [];
        // Fetch user data for each comment
        const commentsWithUserData = await Promise.all(
          commentsData.map(async (comment) => {
            const usersRef = collection(firestore, "users");
            const q = query(usersRef, where("email", "==", comment.email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              const userData = userDoc.data();
              return {
                ...comment,
                userName: userData.name || "Anonymous",
                userAvatar: userData.avatar || null,
              };
            } else {
              return {
                ...comment,
                userName: "Anonymous",
                userAvatar: null,
              };
            }
          })
        );
        setComments(commentsWithUserData);
      }
    };

    fetchComments();
  }, [recipeId]);

  const addComment = async () => {
    if (newComment.trim() === "") return;

    const firestore = getFirestore();
    const recipeRef = doc(firestore, "post", recipeId);

    try {
      const commentWithEmail = {
        text: newComment,
        email: currentUser.email, // Use the user's email instead of the User ID
        timestamp: new Date().toISOString(),
      };

      const recipeDoc = await getDoc(doc(firestore, "post", recipeId));
      const recipeData = recipeDoc.data();
      if (recipeData.userId !== currentUser.uid) {
        createNotification(recipeId, recipeData.userId);
      }

      await updateDoc(recipeRef, {
        comments: arrayUnion(commentWithEmail),
      });

      // Fetch user data using the email
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("email", "==", currentUser.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        setComments([
          ...comments,
          {
            ...commentWithEmail,
            userName: userData.name || "Anonymous",
            userAvatar: userData.avatar || null,
          },
        ]);
      } else {
        setComments([
          ...comments,
          {
            ...commentWithEmail,
            userName: "Anonymous",
            userAvatar: null,
          },
        ]);
      }

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  const createNotification = async (recipeId, recipeOwnerId) => {
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
      type: "comment",
      senderId: user.uid,
      senderName: userData.name || "Anonymous",
      senderAvatar: userData.imageUrl || null,
      recipientId: recipeOwnerId,
      recipeId,
      createdAt: serverTimestamp(),
    });
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setNewComment(comment.text);
  };

  const handleDeleteComment = async (comment) => {
    const firestore = getFirestore();
    const recipeRef = doc(firestore, "post", recipeId);

    try {
      const recipeDoc = await getDoc(recipeRef);
      const recipeData = recipeDoc.data();

      if (
        comment.email === currentUser.email ||
        recipeData.userId === currentUser.uid
      ) {
        const currentComments = recipeData.comments;
        const updatedComments = currentComments.filter(
          (c) => c.timestamp !== comment.timestamp
        );

        await updateDoc(recipeRef, {
          comments: updatedComments,
        });

        setComments(comments.filter((c) => c.timestamp !== comment.timestamp));
      }
    } catch (error) {
      console.error("Error deleting comment: ", error);
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment || newComment.trim() === "") return;

    const firestore = getFirestore();
    const recipeRef = doc(firestore, "post", recipeId);

    try {
      const recipeDoc = await getDoc(recipeRef);
      const currentComments = recipeDoc.data().comments;
      const updatedComments = currentComments.map((comment) => {
        if (comment.timestamp === editingComment.timestamp) {
          return { ...comment, text: newComment };
        }
        return comment;
      });

      await updateDoc(recipeRef, {
        comments: updatedComments,
      });

      setComments(
        comments.map((comment) => {
          if (comment.timestamp === editingComment.timestamp) {
            return { ...comment, text: newComment };
          }
          return comment;
        })
      );

      setNewComment("");
      setEditingComment(null);
    } catch (error) {
      console.error("Error updating comment: ", error);
    }
  };

  const renderCommentItem = ({ item }) => (
    <View className="flex-row items-start p-4 bg-white rounded-lg mb-2 shadow-sm">
      <Avatar.Image
        size={40}
        source={
          item.userAvatar
            ? { uri: item.userAvatar }
            : require("../../assets/Avatar.png")
        }
        className="mr-3"
      />
      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <Text className="font-bold text-sm">{item.userName}</Text>
          <View className="flex-row items-center ml-2">
            {item.email === currentUser.email && (
              <IconButton
                icon={require("../../assets/edit-icon.png")}
                size={20}
                onPress={() => handleEditComment(item)}
                style={{ margin: 0, padding: 0 }}
              />
            )}
            <IconButton
              icon={require("../../assets/delete-icon.png")}
              size={20}
              onPress={() => handleDeleteComment(item)}
              style={{ margin: 0, padding: 0 }}
            />
          </View>
        </View>
        <Text className="text-sm text-gray-700 -mt-1">{item.text}</Text>
        <Text className="text-xs text-gray-500 mt-1">
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-100"
    >
      <View className="p-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center mb-4">
          <Image
            className="w-12 h-12 rounded-full mr-3"
            source={
              typeof authorAvatar === "string"
                ? { uri: authorAvatar }
                : authorAvatar
            }
          />
          <View className="flex-col">
            <Text className="font-bold text-lg">{authorName}</Text>
            <Text className="text-base text-gray-600">{recipeName}</Text>
          </View>
        </View>
      </View>
      <FlatList
        data={comments}
        renderItem={renderCommentItem}
        keyExtractor={(item, index) => index.toString()}
        className="border-b border-gray-200"
        ListEmptyComponent={
          <Text className="text-center text-gray-500 py-4">
            No comments yet.
          </Text>
        }
      />
      <View className="p-4 bg-white border-t border-gray-200">
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
          />
          <Button
            mode="contained"
            className="bg-[#f2a586] rounded-full"
            onPress={editingComment ? handleUpdateComment : addComment}
          >
            {editingComment ? "Update" : "Post"}
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
