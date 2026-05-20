import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-black">
      
      <Text className="text-white text-3xl font-bold mb-6">
        My App
      </Text>

      <TouchableOpacity
        className="bg-white px-6 py-3 rounded-xl"
        onPress={() => router.push("/groups")}
      >
        <Text className="text-black font-semibold">
          Voir les projets
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  )
}