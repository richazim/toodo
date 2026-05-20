import { Ionicons } from "@expo/vector-icons";
import Drawer from "expo-router/drawer";

export default function AnotherRootLayout() {
  return (
    <>
      {/* <Drawer />  */}
          {/* Drawer of Splash screen and setting screen */}
          {/* 
            The <Drawer /> component from Expo Router automatically picks up your routes and displays them in a drawer.
          */}
          <Drawer
            screenOptions={{
              drawerActiveTintColor: "red",
              drawerHideStatusBarOnOpen: true,
            }}
          >
            <Drawer.Screen
              name="index"
              options={{
                drawerLabel: "Home",
                title: "Flashy",
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="home" size={size} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="settings/index"
              options={{
                drawerLabel: "Paramètres",
                title: "Mes Paramètres",
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="newspaper" size={size} color={color} />
                ),
              }}
            />
          </Drawer>
    </>
  )
}