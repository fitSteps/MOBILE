import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import LogoutScreen from './screens/LogoutScreen';
import { NavigationContainer } from '@react-navigation/native';

// Import MQTT client setup
import { MQTTProvider } from './mqttProvider'; // Assuming you wrap the MQTT client in a context provider

const Stack = createNativeStackNavigator();

function App() {
  return (
    <MQTTProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Logout" component={LogoutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </MQTTProvider>
  );
}

export default App;
