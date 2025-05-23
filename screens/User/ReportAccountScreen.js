import React, { useState } from "react";
import { Text } from "react-native-paper";
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "../../firebaseconfig";

export default function ReportAccountScreen({ route, navigation }) {
  const { reportedUserName } = route.params;
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const reasons = [
    "Harassment or bullying",
    "Impersonation",
    "Inappropriate content",
    "Spam",
    "Fake account",
    "Other",
  ];

  const handleReasonSelect = (selectedReason) => {
    setReason(selectedReason);
  };

  const handleSubmit = async () => {
    if (!reason) {
      Alert.alert("Error", "Please select a reason for reporting.");
      return;
    }

    const firestore = getFirestore();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "You must be logged in to report an account.");
      return;
    }

    try {
      await addDoc(collection(firestore, "reports_account"), {
        reportedUserName,
        reportingUserId: user.uid,
        reportingUserEmail: user.email,
        reason,
        details,
        type: "account",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        "Report Submitted",
        "Thank you for your report. We will review it shortly.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit report. Please try again.");
    }
  };

  return (
    <ScrollView className="flex-1 p-5 bg-white">
      <Text className="text-xl font-bold mb-5">
        Report User: {reportedUserName}
      </Text>

      <Text className="text-base font-semibold mb-3">
        Select reason for reporting:
      </Text>
      <View className="flex-row flex-wrap mb-5">
        {reasons.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => handleReasonSelect(item)}
            className={`bg-gray-200 rounded-full px-4 py-2 m-1 ${
              reason === item ? "bg-[#f2a586]" : ""
            }`}
          >
            <Text
              className={`text-sm ${
                reason === item ? "text-white" : "text-gray-700"
              }`}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-base mb-2.5">Additional details (optional):</Text>
      <TextInput
        className="border border-gray-300 p-2 mb-2 rounded"
        value={details}
        onChangeText={setDetails}
        multiline
      />

      <TouchableOpacity
        className="bg-[#f2a586] p-4 rounded-lg items-center mt-4"
        onPress={handleSubmit}
      >
        <Text className="text-white text-lg font-bold">Submit Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
