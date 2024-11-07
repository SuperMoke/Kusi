import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { Text } from "react-native-paper";
import { Alert } from "react-native";

export default function Admin_ReportAccountDetail({ route }) {
  const { report } = route.params;
  const navigation = useNavigation();
  const [reporterName, setReporterName] = useState(null);
  const [userData, setUserData] = useState(null);

  navigation.setOptions({
    title: `Report for ${report.reportedUserName}`,
  });

  useEffect(() => {
    if (report.reportingUserId) {
      fetchReporterName(report.reportingUserId);
    }
    if (report.reportedUserId) {
      fetchUserData(report.reportedUserName);
    }
  }, [report]);

  const fetchReporterName = async (userId) => {
    const firestore = getFirestore();
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("uid", "==", userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setReporterName(querySnapshot.docs[0].data().name);
    }
  };

  const fetchUserData = async (userId) => {
    const firestore = getFirestore();
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("uid", "==", userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setUserData(querySnapshot.docs[0].data());
    }
  };

  const handleBanUser = async () => {
    Alert.alert("Ban User", "Are you sure you want to ban this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Ban",
        onPress: async () => {
          const firestore = getFirestore();
          try {
            // Update user status to banned
            const usersRef = collection(firestore, "users");
            const q = query(
              usersRef,
              where("name", "==", report.reportedUserName)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              // Ban the user
              await updateDoc(querySnapshot.docs[0].ref, {
                status: "banned",
              });

              // Check if report.id exists before updating
              if (report.id) {
                const reportsRef = doc(firestore, "reports_account", report.id);
                await updateDoc(reportsRef, {
                  status: "finished",
                });
              }

              Alert.alert(
                "Success",
                "User has been banned and report marked as finished"
              );
              navigation.goBack();
            }
          } catch (error) {
            Alert.alert("Error", "Failed to ban user");
            console.log(error);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="bg-white rounded-lg shadow-lg p-4">
        <Text className="text-xl font-bold mb-4">Report Details</Text>
        <Text className="text-gray-600 mb-2">
          Reported User: {report.reportedUserName}
        </Text>
        <Text className="text-gray-600 mb-2">Reason: {report.reason}</Text>
        <Text className="text-gray-600 mb-2">Details: {report.details}</Text>
        <Text className="text-gray-600 mb-2">Status: {report.status}</Text>
        {reporterName && (
          <Text className="text-gray-600 mb-2">Reporter: {reporterName}</Text>
        )}
        {userData && (
          <View className="mt-4">
            <Text className="text-xl font-bold mb-2">User Information</Text>
            <Text className="text-gray-600 mb-2">Email: {userData.email}</Text>
            <Text className="text-gray-600 mb-2">Name: {userData.name}</Text>
          </View>
        )}
        <TouchableOpacity
          className="bg-[#f2a586] p-3 rounded-md items-center mt-4"
          onPress={handleBanUser}
        >
          <Text className="text-white font-bold">Ban User</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
