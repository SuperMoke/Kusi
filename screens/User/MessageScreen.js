import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Text, Avatar, Divider } from 'react-native-paper';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebaseconfig';

const MessageScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', currentUser.uid),
        orderBy('lastUpdated', 'desc'),
        limit(20)
      );

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const chatData = [];
        for (const doc of querySnapshot.docs) {
          const chat = { id: doc.id, ...doc.data() };
          const otherParticipantId = chat.participants.find(id => id !== currentUser.uid);
          
          const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', otherParticipantId)));
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            chat.otherParticipantName = userData.name || 'Unknown User';
          } else {
            chat.otherParticipantName = 'Unknown User';
          }
          
          chatData.push(chat);
        }
        setChats(chatData);
        setRefreshing(false); // Stop refreshing after data is fetched
      });

      return () => unsubscribe();
    }
  }, [refreshing]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // The useEffect will handle the refresh by re-fetching the data
  }, []);

  const renderChatItem = ({ item }) => {
    const otherParticipantId = item.participants.find(id => id !== auth.currentUser.uid);
    const isLastMessageFromCurrentUser = item.lastMessageSender === auth.currentUser.uid;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate("ChatScreen", { userId: otherParticipantId, displayName: item.otherParticipantName })}
      >
        <Avatar.Text  size={50} label={item.otherParticipantName[0].toUpperCase()} />
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{item.otherParticipantName}</Text>
          <View style={styles.lastMessageContainer}>
            <Text style={styles.lastMessageSender}>
              {isLastMessageFromCurrentUser ? 'You: ' : `${item.otherParticipantName}: `}
            </Text>
            <Text numberOfLines={1} style={styles.lastMessage}>
              {item.lastMessage || 'No messages yet'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  chatInfo: {
    marginLeft: 16,
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessageSender: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

export default MessageScreen;