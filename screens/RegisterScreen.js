import React, { useState } from "react";
import { View, Image, Platform } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { auth, storage } from "../firebaseconfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { collection, addDoc, getFirestore } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";

export default function RegisterScreen() {
  const navigation = useNavigation();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignup = async () => {
    // Prevent signup if already signing up
    if (isSigningUp) {
      return;
    }

    // Validate user input
    if (!fullname || !email || !password) {
      alert("All fields are required");
      return;
    }
    if (password !== confirmpassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setIsSigningUp(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      if (user) {
        await updateProfile(user, {
          displayName: fullname,
        });
        const firestore = getFirestore();
        const usersCollection = collection(firestore, "users");
        await addDoc(usersCollection, {
          uid: user.uid, 
          name: fullname,
          email: email,
          location: location,
          role: "user",
          socials: sociallinks,
        });
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Error signing up:", error.message);
      alert("There's an error while signing up. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };
  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <ScrollView>
      <View className="flex-1 bg-white items-center justify-center p-4">
        <Image
          className="w-72 h-60 "
          resizeMode="contain"
          source={require("../assets/Logo.png")}
        />
        <Text className="text-2xl mb-4">Create A New Account</Text>
        <TextInput
          label="Full Name"
          className="w-full mb-4"
          mode="outlined"
          value={fullname}
          onChangeText={setFullname}
        />
        <TextInput
          label="Address"
          className="w-full mb-4"
          mode="outlined"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          label="Email"
          className="w-full mb-4"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
        />
        
        <TextInput
          label="Password"
          className="w-full mb-4"
          mode="outlined"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          label="Confirm Password"
          className="w-full mb-4"
          mode="outlined"
          secureTextEntry
          value={confirmpassword}
          onChangeText={setConfirmPassword}
        />
        <Button
          mode="contained"
          onPress={handleSignup}
          className="w-full mb-4 bg-[#f2a586]"
          disabled={isSigningUp}
        >
          Sign Up
        </Button>
        <Text className="text-black ">
          Already have an account?{" "}
          <Text className="text-blue-500" onPress={handleLogin}>
            Login Here
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}
