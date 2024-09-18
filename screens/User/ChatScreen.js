import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Avatar, Button } from "react-native-paper";
import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
  getDocs,
  where,
} from "firebase/firestore";
import { db, auth } from "../../firebaseconfig";

const ChatScreen = ({ route, navigation }) => {
  const { userId, displayName } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const flatListRef = useRef(null);
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      title: displayName,
    });

    const fetchOrCreateChat = async () => {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      let existingChat = querySnapshot.docs.find(doc => 
        doc.data().participants.includes(userId)
      );

      if (existingChat) {
        setChatId(existingChat.id);
      } else {
        const newChatRef = await addDoc(chatsRef, {
          participants: [auth.currentUser.uid, userId],
          lastUpdated: new Date(),
          lastMessage: "",
          lastMessageSender: "",
        });
        setChatId(newChatRef.id);
      }
    };

    fetchOrCreateChat();
  }, [userId, displayName, navigation]);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(newMessages.reverse());
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (inputMessage.trim() === "" || !chatId) return;

    const chatRef = doc(db, "chats", chatId);

    try {
      const messageData = {
        text: inputMessage,
        sender: auth.currentUser.uid,
        timestamp: new Date(),
      };

      await setDoc(
        chatRef,
        {
          lastUpdated: new Date(),
          lastMessage: inputMessage,
          lastMessageSender: auth.currentUser.uid,
        },
        { merge: true }
      );

      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender === auth.currentUser.uid;
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          marginBottom: 10,
          justifyContent: isCurrentUser ? "flex-end" : "flex-start",
        }}
      >
        {!isCurrentUser && (
          <Avatar.Text
            size={30}
            label={displayName[0].toUpperCase()}
            style={{ marginRight: 8 }}
          />
        )}
        <View
          style={{
            backgroundColor: isCurrentUser ? "#DCF8C6" : "#E5E5EA",
            borderRadius: 20,
            padding: 10,
            maxWidth: "70%",
          }}
        >
          <Text>{item.text}</Text>
        </View>
        {isCurrentUser && (
          <Avatar.Text
            size={30}
            label="You"
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    );
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-end",
          padding: 16,
        }}
      />
      <View className="p-4 bg-white border-t border-gray-200">
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
            placeholder="Type a message..."
            value={inputMessage}
            onChangeText={setInputMessage}
          />
          <Button
            mode="contained"
            className="bg-[#f2a586] rounded-full"
            onPress={sendMessage}
          >
            Send
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;