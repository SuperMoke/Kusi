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

export default function Admin_ReportedAccounts() {
  const [reportedAccounts, setReportedAccounts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchReportedAccounts();
  }, []);

  const fetchReportedAccounts = async () => {
    const firestore = getFirestore();
    const reportsQuery = query(
      collection(firestore, "reports_account"),
      orderBy("createdAt", "desc")
    );
    const reportsSnapshot = await getDocs(reportsQuery);
    const accountsData = reportsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReportedAccounts(accountsData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReportedAccounts();
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
        <Text className="text-2xl font-bold mb-2">Reported Accounts</Text>
      </View>
      <View className="px-4 py-2">
        {reportedAccounts.map((report) => (
          <Card className="mb-4 bg-white" key={report.id}>
            <Card.Content>
              <Title>Reported User: {report.reportedUserName}</Title>
              <Paragraph>Reported by: {report.reportingUserEmail}</Paragraph>
              <Paragraph>Reason: {report.reason}</Paragraph>
              <Paragraph>Details: {report.details}</Paragraph>
              <Paragraph>Status: {report.status}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <TouchableOpacity
                className="bg-[#f2a586] p-3 rounded-md items-center"
                onPress={() =>
                  navigation.navigate("Admin_ReportAccountDetail", { report })
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
