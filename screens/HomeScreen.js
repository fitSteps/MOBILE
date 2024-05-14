import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import LogoutButton from './components/LogoutButton';
import { UserContext } from './components/userContext';
import { AntDesign } from '@expo/vector-icons';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

function HomeScreen({ navigation }) {
    const userContext = useContext(UserContext);
    const [profile, setProfile] = useState({});
    const [movements, setMovements] = useState([]);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        getProfile();
        getMovements(date);
    }, []);

    const getProfile = async () => {
        try {
            const res = await fetch("http://108.143.161.80:3001/users/profile", { credentials: "include" });
            const data = await res.json();
            setProfile(data);
        } catch (error) {
            console.log('Fetch profile error:', error);
            Alert.alert('Error', 'Unable to fetch profile.');
        }
    };

    const getMovements = async (date) => {
        try {
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const res = await fetch(`http://108.143.161.80:3001/users/movements/${formattedDate}`, {
                method: "GET",
                headers: { 'Content-Type': 'application/json' },
                credentials: "include"
            });
            const data = await res.json();
            setMovements(data);
        } catch (error) {
            console.log('Fetch movements error:', error);
            Alert.alert('Error', 'Unable to fetch movements.');
        }
    };

    const handleLogout = async () => {
      try {
          // Call the logout endpoint on your server
          const response = await fetch("http://108.143.161.80:3001/users/logout", {
              method: 'POST',  // or 'GET', depending on your server setup
          });
          if (response.ok) {
              // Successfully logged out on the server
              console.log('Logout successful');

              // Clear user context or user state
              userContext.setUserContext(null);

              // Navigate to the Login screen
              navigation.replace('Login');
          } else {
              // Handle server-side errors (optional)
              console.error('Logout failed with status:', response.status);
          }
      } catch (error) {
          // Handle errors in case of network failure
          console.error('Logout failed with error:', error);
      }
  };


  const changeDate = (numDays) => {
    const currentDate = new Date(date);

    currentDate.setDate(currentDate.getDate() + numDays);

    if (currentDate < new Date(profile.dateOfCreating) || currentDate > new Date()) return;

    setDate(currentDate);
    getMovements(currentDate);
  };

    return (
      <>
        <View style={styles.container}>
            <Text style={styles.title}>User Movement</Text>

            <View style={styles.datePicker}>
              <AntDesign
                onPress={() => changeDate(-1)}
                name="left"
                size={30}
              />
              <Text style={styles.date}>{date.toDateString()}</Text>

              <AntDesign
                onPress={() => changeDate(1)}
                name="right"
                size={30}
              />
            </View>

            <Text>Points: {profile.points}</Text>
            <Text>Steps: {movements.steps}</Text>
            <Text>Distance: {movements.distance}</Text>
            <Text>Date: {date.toISOString().split('T')[0]}</Text>
            <Text>Calories: {movements.calories}</Text>
            <LogoutButton onLogout={() => {
                navigation.replace('Logout');
            }} />
        </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
    }
});

export default HomeScreen;
