import React from "react";
import { View, FlatList, Image, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";

export default function PostListScreen({ route }) {
  const { userPosts, displayName } = route.params;

  const renderPostItem = ({ item }) => (
    <View className="border-b border-gray-200 mb-4">
      <View className="flex-row items-center p-4">
        <Image
          className="w-10 h-10 rounded-full mr-3"
          source={
            item.authorData?.profilePicture
              ? { uri: item.authorData.profilePicture }
              : require("../../assets/Avatar.png")
          }
        />
        <Text className="font-bold text-base">{displayName}</Text>
      </View>
      <Image className="w-full h-80" source={{ uri: item.imageUrl }} />
      <View className="p-4">
        <Text className="font-bold text-lg mb-2">{item.recipeName}</Text>
        <Text className="text-gray-700 mb-2">{item.ingredients}</Text>
      </View>
      <View className="flex-row justify-around pb-4">
        <View className="flex-row items-center">
          <Image
            className="w-5 h-5 mr-1"
            source={require("../../assets/heart-icon.png")}
          />
          <Text>{item.likes?.length || 0} likes</Text>
        </View>
        <View className="flex-row items-center">
          <Image
            className="w-5 h-5 mr-1"
            source={require("../../assets/comment-icon.png")}
          />
          <Text>{item.comments?.length || 0} comments</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={userPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
