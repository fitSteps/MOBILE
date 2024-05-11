import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import Value from '../components/Value';
import useHealthData from '../hooks/useHealthData';

import { AntDesign } from '@expo/vector-icons';

export default function Home() {
    const [date, setDate] = useState(new Date());
  const { steps, flights, distance } = useHealthData(date);

  const changeDate = (numDays: number) => {
    const currentDate = new Date(date); // Create a copy of the current date
    // Update the date by adding/subtracting the number of days
    currentDate.setDate(currentDate.getDate() + numDays);

    setDate(currentDate); // Update the state variable
  };

  return (
    <View>
      <View>
        <AntDesign
          onPress={() => changeDate(-1)}
          name="left"
          size={20}
        />
        <Text>{date.toDateString()}</Text>

        <AntDesign
          onPress={() => changeDate(1)}
          name="right"
          size={20}
        />
      </View>

      <View>
        <Value label="Steps" value={steps.toString()} />
        <Value label="Distance" value={`${(distance / 1000).toFixed(2)} km`} />
        <Value label="Flights Climbed" value={flights.toString()} />
      </View>

      <StatusBar style="auto" />
    </View>
  );
}