// App.js

// Import 'react-native-gesture-handler' ở đầu (sau polyfills đã được import ở index.js)
import "react-native-gesture-handler";

import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View, Platform } from "react-native";

// Import Contexts và Screens
import { AuthProvider, useAuth } from "./components/AuthContext";
import { CarProvider } from "./components/CarContext";
import { BookingProvider } from "./components/BookingContext";
import { FavoritesProvider } from "./components/FavoritesContext";

import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import HomeScreen from "./components/HomeScreen";
import CarListScreen from "./components/CarListScreen";
import CarDetailScreen from "./components/CarDetailScreen";
import AddCarScreen from "./components/AddCarScreen";
import TripsScreen from "./components/TripsScreen";
import MyCarsScreen from "./components/MyCarsScreen";
import AdminScreen from "./components/AdminScreen";
import PaymentScreen from "./components/PaymentScreen";

const Stack = createStackNavigator();

// Theme cho phép background gradient hiển thị (nếu bạn sử dụng)
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
  },
};

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#fff" }, // Hoặc màu bạn muốn
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Đăng nhập", headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Đăng ký" }}
      />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#fff" }, // Hoặc màu bạn muốn
        headerShadowVisible: Platform.OS === "ios" ? false : true, // Tùy chỉnh bóng đổ theo OS
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Xevivu" }} />
      <Stack.Screen name="CarList" component={CarListScreen} options={{ title: "Xe cho thuê" }} />
      <Stack.Screen name="CarDetail" component={CarDetailScreen} options={{ title: "Chi tiết xe" }} />
      <Stack.Screen name="AddCar" component={AddCarScreen} options={{ title: "Đăng xe" }} />
      <Stack.Screen name="Trips" component={TripsScreen} options={{ title: "Chuyến đi" }} />
      <Stack.Screen name="MyCars" component={MyCarsScreen} options={{ title: "Xe của tôi" }} />
      <Stack.Screen name="Admin" component={AdminScreen} options={{ title: "Quản trị" }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: "Thanh toán" }} />
    </Stack.Navigator>
  );
}

// RootNavigator quyết định hiển thị AuthStack hay AppStack
function RootNavigator() {
  const { currentUser, booting } = useAuth(); // Giả sử useAuth trả về trạng thái booting

  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return currentUser ? <AppStack /> : <AuthStack />;
}

// Component App chính, bao bọc bởi các Providers
export default function App() {
  return (
    <AuthProvider>
      <CarProvider>
        <BookingProvider>
          <FavoritesProvider>
            <NavigationContainer theme={navTheme}>
              <RootNavigator />
            </NavigationContainer>
          </FavoritesProvider>
        </BookingProvider>
      </CarProvider>
    </AuthProvider>
  );
}
