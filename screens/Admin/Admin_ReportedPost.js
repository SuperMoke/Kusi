import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { Card, Title, Paragraph, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function Admin_ReportedPosts() {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchReportedPosts();
  }, []);

  const fetchReportedPosts = async () => {
    const firestore = getFirestore();
    const reportsQuery = query(
      collection(firestore, "reports_post"),
      orderBy("createdAt", "desc")
    );
    const reportsSnapshot = await getDocs(reportsQuery);
    const postsData = reportsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReportedPosts(postsData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReportedPosts();
    setRefreshing(false);
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="bg-white p-4 pb-6">
        <Text className="text-2xl font-bold mb-2">Reported Posts</Text>
      </View>
      <View className="px-4 py-2">
        {reportedPosts.map((post) => (
          <Card className="mb-4 bg-white" key={post.id}>
            <Card.Content>
              <Title>Post by: {post.reportedUserName}</Title>
              <Paragraph>Post ID: {post.reportedPostId}</Paragraph>
              <Paragraph>Reason: {post.reason}</Paragraph>
              <Paragraph>Details: {post.details}</Paragraph>
              <Paragraph>Status: {post.status}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <TouchableOpacity
                className="bg-[#f2a586] p-3 rounded-md items-center"
                onPress={() =>
                  navigation.navigate("Admin_ReportPostDetail", {
                    report: post,
                  })
                }
              >
                <Text className="text-white font-bold">Take Action</Text>
              </TouchableOpacity>
            </Card.Actions>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
