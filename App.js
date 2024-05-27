import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import LogoutScreen from './screens/LogoutScreen';
import FriendListScreen from './screens/FriendListScreen';
import ChallengesScreen from './screens/ChallengesScreen';
import { NavigationContainer } from '@react-navigation/native';
import SubscriberScreen from './screens/SubscriberScreen';
import { MQTTProvider } from './mqttProvider'; // Assuming you wrap the MQTT client in a context provider
import { UserContext } from './screens/components/userContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom tab navigator for main application screens
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Subscriber" component={SubscriberScreen} />
      <Tab.Screen name="Friends" component={FriendListScreen} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} />
      <Tab.Screen name="Logout" component={LogoutScreen} />
    </Tab.Navigator>
  );
}

function App() {
  const [user, setUser] = useState(localStorage.user ? JSON.parse(localStorage.user) : null);
  const updateUserData = (userInfo) => {
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  }
  return (
    <UserContext.Provider value={{ user: user, setUserContext: updateUserData }}>

      <MQTTProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            {/* Once logged in, the user moves to the main app interface which uses bottom tabs */}
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </MQTTProvider>
    </UserContext.Provider>
  );
}

export default App;