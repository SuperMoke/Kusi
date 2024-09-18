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
import { auth } from "../../firebaseconfig"; // Adjust the path as necessary

export default function ReportAccountScreen({ route, navigation }) {
  const { reportedPostId, reportedUserName } = route.params;
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const reasons = [
    "Inappropriate content",
    "Harassment or bullying",
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
      await addDoc(collection(firestore, "reports"), {
        reportedPostId,
        reportedUserName,
        reportingUserId: user.uid,
        reason,
        details,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Your report has been submitted successfully.");
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    }
  };

  return (
    <ScrollView className="flex-1 p-5 bg-white">
      <Text className="text-lg mb-5">Reporting: {reportedUserName}</Text>

      <Text className="text-base mb-2.5">Reason for reporting:</Text>
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
        className="bg-[#f2a586] p-3.5 rounded-md items-center"
        onPress={handleSubmit}
      >
        <Text className="text-white text-lg font-bold">Submit Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
