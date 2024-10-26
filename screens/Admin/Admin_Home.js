import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
} from "react-native";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { Card, Title, Paragraph, Text } from "react-native-paper";

export default function Admin_Home() {
  const [reportedPosts, setReportedPosts] = useState([]);

  const [reportedAccounts, setReportedAccounts] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const firestore = getFirestore();

    // Fetch reported accounts
    const accountReportsQuery = query(
      collection(firestore, "reports_account"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const accountReportsSnapshot = await getDocs(accountReportsQuery);
    const accountReports = accountReportsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReportedAccounts(accountReports);

    // Fetch reported posts
    const postReportsQuery = query(
      collection(firestore, "reports_post"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const postReportsSnapshot = await getDocs(postReportsQuery);
    const postReports = postReportsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReportedPosts(postReports);

    // Existing verification requests fetch
    const verificationQuery = query(
      collection(firestore, "verificationRequests"),
      orderBy("timestamp", "desc"),
      limit(5)
    );
    const verificationSnapshot = await getDocs(verificationQuery);
    const verifications = verificationSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setVerificationRequests(verifications);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
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
        <Text className="text-2xl font-bold mb-2">Welcome Admin!</Text>
      </View>
      <View className="px-2 py-2">
        <View className="flex-row flex-wrap gap-2 mb-4">
          <View className="flex-col items-center border border-gray-200 rounded-md px-4 py-3 w-[31%] bg-white shadow-sm">
            <Image
              source={require("../../assets/report-icon.png")}
              className="h-8 w-8 mb-2"
            />
            <Text className="text-gray-700 text-lg font-bold">
              {reportedAccounts.length}
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              Reported Post
            </Text>
          </View>

          <View className="flex-col items-center border border-gray-200 rounded-md px-4 py-3 w-[31%] bg-white shadow-sm">
            <Image
              source={require("../../assets/verification-icon.png")}
              className="h-8 w-8 mb-2"
            />
            <Text className="text-gray-700 text-lg font-bold">
              {verificationRequests.length}
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              Verification Requests
            </Text>
          </View>

          <View className="flex-col items-center border border-gray-200 rounded-md px-4 py-3 w-[31%] bg-white shadow-sm">
            <Image
              source={require("../../assets/group.png")}
              className="h-8 w-8 mb-2"
            />
            <Text className="text-gray-700 text-lg font-bold">
              {reportedAccounts.length}
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              Reported Account
            </Text>
          </View>
        </View>
      </View>

      <View className="px-4 py-2">
        <Text className="text-xl font-bold mb-2">
          Latest Verification Requests
        </Text>
        {verificationRequests.map((request) => (
          <Card key={request.id} className="mb-4 bg-white shadow-sm">
            <Card.Content>
              <Title>User: {request.displayName}</Title>
              <Paragraph>User Title: {request.userTitle}</Paragraph>
              <Paragraph>Introduction: {request.introduction}</Paragraph>
              <Paragraph>Status: {request.status}</Paragraph>
            </Card.Content>
          </Card>
        ))}
      </View>
      <View className="px-4 py-2">
        <Text className="text-xl font-bold mb-2">Latest Reported Accounts</Text>
        {reportedAccounts.map((report) => (
          <Card key={report.id} className="mb-4 bg-white shadow-sm">
            <Card.Content>
              <Title>Reported User: {report.reportedUserName}</Title>
              <Paragraph>Reported by: {report.reportingUserEmail}</Paragraph>
              <Paragraph>Reason: {report.reason}</Paragraph>
              <Paragraph>Details: {report.details}</Paragraph>
              <Paragraph>Status: {report.status}</Paragraph>
            </Card.Content>
          </Card>
        ))}
      </View>

      <View className="px-4 py-2">
        <Text className="text-xl font-bold mb-2">Latest Reported Posts</Text>
        {reportedPosts.map((post) => (
          <Card key={post.id} className="mb-4 bg-white shadow-sm">
            <Card.Content>
              <Title>Post by: {post.reportedUserName}</Title>
              <Paragraph>Post ID: {post.reportedPostId}</Paragraph>
              <Paragraph>Reason: {post.reason}</Paragraph>
              <Paragraph>Details: {post.details}</Paragraph>
              <Paragraph>Status: {post.status}</Paragraph>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
