import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import {
  initialize,
  requestPermission,
  readRecords,
} from 'react-native-health-connect';
import { TimeRangeFilter } from 'react-native-health-connect/lib/typescript/types/base.types';

import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
} from 'react-native-health';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.FlightsClimbed,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
    ],
    write: [],
  },
};

const useHealthData = (date: Date) => {
  const [steps, setSteps] = useState(0);
  const [flights, setFlights] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [hasPermissions, setHasPermission] = useState(false);

  const readAndroidData = async () => {
    const isInitialized = await initialize();
    if (!isInitialized) {
      return;
    }

    // request permissions
    await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'Distance' },
      { accessType: 'read', recordType: 'FloorsClimbed' },
      { accessType: 'read', recordType: 'TotalCaloriesBurned' },
    ]);

    const timeRangeFilter: TimeRangeFilter = {
      operator: 'between',
      startTime: new Date(date.setHours(0, 0, 0, 0)).toISOString(),
      endTime: new Date(date.setHours(23, 59, 59, 999)).toISOString(),
    };

    // Steps
    const steps = await readRecords('Steps', { timeRangeFilter });
    const totalSteps = steps.reduce((sum, cur) => sum + cur.count, 0);
    setSteps(totalSteps);
    //console.log(steps);

    // Distance
    const distance = await readRecords('Distance', { timeRangeFilter });
    const totalDistance = distance.reduce(
      (sum, cur) => sum + cur.distance.inMeters,
      0
    );
    setDistance(totalDistance);
    //console.log(distance);

    // Floors climbed
    const floorsClimbed = await readRecords('FloorsClimbed', {
      timeRangeFilter,
    });
    const totalFloors = floorsClimbed.reduce((sum, cur) => sum + cur.floors, 0);
    setFlights(totalFloors);
    // console.log(floorsClimbed);

    // Calories
    const calories = await readRecords('TotalCaloriesBurned', {
      timeRangeFilter,
    });
    const totalCalories = calories.reduce((sum, cur) => sum + cur.energy.inKilocalories, 0);
    setCalories(totalCalories);
    //console.log(totalCalories);
  };

  const readIOSData = async () => {
    AppleHealthKit.isAvailable((err, isAvailable) => {
      if (err) {
        console.log('Error checking availability');
        return;
      }
      if (!isAvailable) {
        console.log('Apple Health not available');
        return;
      }
      AppleHealthKit.initHealthKit(permissions, (err) => {
        if (err) {
          console.log('Error getting permissions');
          return;
        }
        setHasPermission(true);
      });
    });

    if (hasPermissions) {
      const options: HealthInputOptions = {
        date: date.toISOString(),
        includeManuallyAdded: false,
      };
  
      AppleHealthKit.getStepCount(options, (err, results) => {
        if (err) {
          console.log('Error getting the steps');
          return;
        }
        setSteps(results.value);
      });
  
      AppleHealthKit.getFlightsClimbed(options, (err, results) => {
        if (err) {
          console.log('Error getting the steps:', err);
          return;
        }
        setFlights(results.value);
      });
  
      AppleHealthKit.getDistanceWalkingRunning(options, (err, results) => {
        if (err) {
          console.log('Error getting the steps:', err);
          return;
        }
        setDistance(results.value);
      });
    }
    return;
  };

  useEffect(() => {
    if (Platform.OS == 'android') {
      readAndroidData();
    }
    else if (Platform.OS == 'ios') {
      readIOSData();
    }
    return;
    
  }, [date]);

  return {
    steps,
    flights,
    distance,
    calories,
  };
};

export default useHealthData;
