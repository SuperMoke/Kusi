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
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  where
} from "firebase/firestore";
import { Card, Title, Text, Paragraph } from "react-native-paper";

export default function Admin_Verification() {
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
    const firestore = getFirestore();
    const verificationQuery = query(
      collection(firestore, "verificationRequests"),
      orderBy("timestamp", "desc")
    );
    const verificationSnapshot = await getDocs(verificationQuery);
    const verificationData = verificationSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setVerificationRequests(verificationData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVerificationRequests();
    setRefreshing(false);
  };

  const handleAction = (request) => {
    Alert.alert(
      "Action",
      `Do you want to take action on this verification request with ID: ${request.id}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const firestore = getFirestore();
              const userDocRef = collection(firestore, "users");
              const q = query(userDocRef, where("uid", "==", request.userId));
              const querySnapshot = await getDocs(q);
              if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                await updateDoc(userDoc.ref, { userTitle: request.userTitle });
              }
              const verificationDocRef = doc(
                firestore,
                "verificationRequests",
                request.id
              );
              await deleteDoc(verificationDocRef);
              await fetchVerificationRequests();
              console.log(
                `Verification request for user: ${request.userId} has been approved and deleted.`
              );
            } catch (error) {
              console.error('Error handling verification request:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="bg-white p-4 pb-6">
        <Text className="text-2xl font-bold mb-2">Verification Requests</Text>
      </View>
      <View className="px-4 py-2">
        {verificationRequests.map((request) => (
          <Card key={request.id} className="mb-4 bg-white shadow-sm">
            <Card.Content>
              <Title>User: {request.displayName}</Title>
              <Paragraph>User Title: {request.userTitle}</Paragraph>
              <Paragraph>Introduction: {request.introduction}</Paragraph>
              <Paragraph>Status: {request.status}</Paragraph>
              <View className="flex-col justify-between items-center mt-4">
                <View className="flex-col items-center">
                  <Text className="text-gray-500 text-sm mb-2 font-bold mt-1">
                    ID Front
                  </Text>
                  <Image
                    source={{ uri: request.idFrontUrl }}
                    className="w-72 h-56 rounded"
                  />
                </View>
                <View className="flex-col items-center">
                  <Text className="text-gray-500 text-sm mb-2 font-bold mt-1">
                    ID Back
                  </Text>
                  <Image
                    source={{ uri: request.idBackUrl }}
                    className="w-72 h-56 rounded"
                  />
                </View>
              </View>
            </Card.Content>
            <Card.Actions>
              <TouchableOpacity
                className="bg-[#f2a586] p-3 rounded-md items-center"
                onPress={() => handleAction(request)}
              >
                <Text className="text-white font-bold">
                  Approve The Request
                </Text>
              </TouchableOpacity>
            </Card.Actions>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}