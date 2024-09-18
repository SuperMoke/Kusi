import React, { useState } from "react";
import { View, Image } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseconfig";
import { useNavigation } from "@react-navigation/native";
import { collection, getFirestore, query, where,getDocs } from "firebase/firestore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    if(!email || !password){
      alert("Please enter email and password");
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const firestore = getFirestore ();
      const useRef = collection(firestore, "users");
      const q = query(useRef,where("email", "==", email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if(userData.role === "user"){
          navigation.navigate("Home");
        } else if (userData.role === "admin") {
          navigation.navigate("Admin_Home");
        } else {
          alert("There's something wrong. Try again");
        }
      })
    } catch (error) {
      console.log(error);
      alert("Login failed. Please check your credentials.");
    }
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <Image
        className="w-72 h-60"
        source={require("../assets/Logo.png")}
      />
      <Text className="text-2xl mb-4">Login to your account</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        className="w-full mb-4"
        mode="outlined"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        className="w-full mb-4"
        mode="outlined"
        secureTextEntry
      />
      <Button
        mode="elevated"
        onPress={handleLogin}
        className="w-full mt-4 bg-[#f2a586] "
        textColor="white"
      >
        Login
      </Button>
      <Text className="mt-5 text-black">
        Don't Have an Account?{" "}
        <Text className="text-blue-500" onPress={handleRegister}>
          Register Here
        </Text>
      </Text>
    </View>
  );
}