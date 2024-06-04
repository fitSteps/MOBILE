import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import LogoutButton from './components/LogoutButton';
import { UserContext } from './components/userContext';
import { AntDesign } from '@expo/vector-icons';
import useHealthData from '../src/hooks/useHealthData';
import Value from '../src/components/Value';
import { MQTTContext } from '../mqttProvider';
//import DeviceInfo from 'react-native-device-info';

function HomeScreen({ navigation }) {
    const { client } = useContext(MQTTContext);
    const userContext = useContext(UserContext);
    const [profile, setProfile] = useState({});
    const [movements, setMovements] = useState([]);
    const [date, setDate] = useState(new Date());
    const { steps, flights, distance, calories } = useHealthData(date);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            const res = await fetch("http://188.230.209.59:3001/users/profile", { credentials: "include" });
            const data = await res.json();
            setProfile(data);
        } catch (error) {
            console.log('Fetch profile error:', error);
            Alert.alert('Error', 'Unable to fetch profile.');
        }
    };
    /*
    const sendUUIDToServer = async () => {
        const uuid = await DeviceInfo.getUniqueId();
        console.log('UUID:', uuid);
        try {
            const response = await fetch(`http://172.201.117.179:3001/users`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneUUID: uuid })
            });
            if (response.ok) {
                const updatedUser = await response.json();
                setProfile(updatedUser);
                Alert.alert("Update Successful", "Your device ID has been updated.");
            } else {
                throw new Error('Failed to update UUID on server');
            }
        } catch (error) {
            console.error('Error updating UUID:', error);
            Alert.alert("Update Failed", "Could not update your device ID on the server.");
        }
    };*/

    const updateMovement = async () => {
        const response = await fetch(`http://188.230.209.59:3001/users/movements/${date}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ steps, distance, flightsClimbed: flights, calories })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Success:', data);
            if (client && client.isConnected()) {
                //console.log('Succ',userContext.user._id);
                client.publish(`challenges/updates/${userContext.user._id}`, JSON.stringify({
                    userId: userContext.userId,
                    points: data.points
                }), 0, false);
            }
        } else {
            console.error('Failed to update movements:', response.statusText);
        }
        getProfile();
    };

    const handleLogout = async () => {
      try {
          // Call the logout endpoint on your server
          const response = await fetch("http://188.230.209.59:3001/users/logout", {
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

    if (currentDate < new Date(profile.dateOfCreating) || currentDate > new Date(new Date().setDate(new Date().getDate() + 1))) return;

    setDate(currentDate);
    updateMovement();
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

            <View>
                <Value label="Points" value={profile.points} />
                <Value label="Steps" value={steps.toString()} />
                <Value label="Distance" value={`${(distance / 1000).toFixed(2)} km`} />
                <Value label="Flights Climbed" value={flights.toString()} />
                <Value label="Calories Burned" value={calories.toFixed(0)} />
            </View>
           {
           //<Button title="Update UUID" onPress={sendUUIDToServer} />
           }
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
