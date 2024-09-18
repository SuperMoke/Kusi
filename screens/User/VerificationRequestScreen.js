import React, { useState } from "react";
import { View, TouchableOpacity, Image, Alert, TextInput } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import { getAuth } from "firebase/auth";
import { collection, addDoc, getFirestore } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { storage } from "../../firebaseconfig";
import { useNavigation } from "@react-navigation/native";

export default function VerificationRequestScreen() {
  const [phase, setPhase] = useState(1);
  const [userInfo, setUserInfo] = useState({
    userTitle: "",
    introduction: "",
    socialLinks: "",
  });
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const navigation = useNavigation();

  const usertitles = [
    "Restaurant Chef",
    "Home Cook",
    "Private Chef",
    "Professional Chef",
    "Food Enthusiast",
    "Food Vlogger",
  ];

  const professionalTitles = ["Restaurant Chef", "Professional Chef"];

  const isProfessionalChef = professionalTitles.includes(userInfo.userTitle);

  const pickImage = async (setImageFunction) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageFunction(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri, folder) => {
    if (!uri) return null;

    const { uri: fileUri } = await FileSystem.getInfoAsync(uri);
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = (e) => reject(new TypeError("Network request failed"));
      xhr.responseType = "blob";
      xhr.open("GET", fileUri, true);
      xhr.send(null);
    });

    const filename = uri.substring(uri.lastIndexOf("/") + 1);
    const storageRef = ref(storage, `${folder}/${filename}`);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  };

  const handlePhaseOne = () => {
    if (userInfo.userTitle && userInfo.introduction && userInfo.socialLinks) {
      setPhase(2);
    } else {
      Alert.alert("Please fill in all fields");
    }
  };

  const handlePhaseTwo = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("User not logged in");
      return;
    }

    if (!idFront || !idBack) {
      Alert.alert("Please provide both front and back of your ID");
      return;
    }

    try {
      const idFrontUrl = await uploadImage(
        idFront,
        `verification/${user.uid}/id_front`
      );
      const idBackUrl = await uploadImage(idBack, `verification/${user.uid}/id_back`);

      const firestore = getFirestore();
      const verificationCollection = collection(
        firestore,
        "verificationRequests"
      );
      await addDoc(verificationCollection, {
        userId: user.uid,
        displayName: user.displayName,
        ...userInfo,
        idFrontUrl,
        idBackUrl,
        status: "Pending",
        timestamp: new Date(),
      });

      Alert.alert("Success", "Verification request submitted successfully!");
      navigation.navigate("Home"); // Adjust this to navigate to the appropriate screen
    } catch (error) {
      console.error("Error submitting verification request", error);
      Alert.alert(
        "Error",
        "Failed to submit verification request. Please try again."
      );
    }
  };

  return (
    <View className="flex-1 p-5 ">
      {phase === 1 ? (
        <ScrollView>
          <View className="">
            <Image
              className="w-72 h-60 mb-4"
              source={require("../../assets/Logo.png")}
            />
            <Text className="text-2xl font-bold mb-5">
              Fill Out the Details
            </Text>
            <Text className="text-base  mb-1.25">User Title:</Text>
            <View className="flex-row flex-wrap mb-4">
              {usertitles.map((title) => (
                <TouchableOpacity
                  key={title}
                  onPress={() => setUserInfo({ ...userInfo, userTitle: title })}
                  className={`rounded-full px-3 py-2 m-1 ${
                    userInfo.userTitle === title
                      ? "bg-[#f2a586]"
                      : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      userInfo.userTitle === title
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-base  mb-1.25">
              Give a short introduction about you:
            </Text>
            <TextInput
              className="border border-gray-300 p-2 mb-2 rounded"
              value={userInfo.introduction}
              onChangeText={(text) =>
                setUserInfo({ ...userInfo, introduction: text })
              }
              multiline
            />
            <Text className="text-base  mb-1.25">Social Links:</Text>
            <TextInput
              className="border border-gray-300 p-2 mb-2 rounded"
              value={userInfo.socialLinks}
              onChangeText={(text) =>
                setUserInfo({ ...userInfo, socialLinks: text })
              }
              multiline
            />
            <TouchableOpacity
              className="bg-[#f2a586] p-3 rounded-md items-center mt-2"
              onPress={handlePhaseOne}
            >
              <Text className="text-white font-bold">Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View>
          <Text className="text-2xl font-bold mb-5">Phase 2: ID Verification</Text>
          <Text className="text-lg mb-2">
            Please provide both front and back of your ID for verification:
          </Text>
          {idFront && (
            <Image
              source={{ uri: idFront }}
              className="w-full h-40 mt-2 rounded"
            />
          )}
          <TouchableOpacity
            className="bg-[#f2a586] p-3 rounded-md items-center mt-2"
            onPress={() => pickImage(setIdFront)}
          >
            <Text className="text-white font-bold">Upload ID (Front)</Text>
          </TouchableOpacity>
          {idBack && (
            <Image
              source={{ uri: idBack }}
              className="w-full h-40 mt-2 rounded"
            />
          )}
          <TouchableOpacity
            className="bg-[#f2a586] p-3 rounded-md items-center mt-2"
            onPress={() => pickImage(setIdBack)}
          >
            <Text className="text-white font-bold">Upload ID (Back)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#f2a586] p-3 rounded-md items-center mt-4"
            onPress={handlePhaseTwo}
          >
            <Text className="text-white font-bold">Submit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}