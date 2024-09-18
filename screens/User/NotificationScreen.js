import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const firestore = getFirestore();
    const notificationsRef = collection(firestore, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, []);

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-200"
      onPress={() => {
        if (item.type === 'like' || item.type === 'comment') {
          navigation.navigate('RecipeDetail', { recipe: { id: item.recipeId } });
        }
      }}
    >
      <Image
        className="w-10 h-10 rounded-full mr-3"
        source={item.senderAvatar ? { uri: item.senderAvatar } : require('../../assets/Avatar.png')}
      />
      <View className="flex-1">
        <Text className="font-bold">{item.senderName}</Text>
        <Text>
          {item.type === 'like' ? 'liked your post' : 'commented on your post'}
        </Text>
        <Text className="text-gray-500 text-xs">{new Date(item.createdAt.toDate()).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 py-4">No notifications yet.</Text>
        }
      />
    </View>
  );
}