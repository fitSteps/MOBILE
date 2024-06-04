import AsyncStorage from '@react-native-async-storage/async-storage';
import init from 'react_native_mqtt';
import {Client} from 'paho-mqtt';

// Initialize with AsyncStorage to prevent data loss warnings
init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});

const createClient = () => {
  try {
      const client = new Client('ws://172.201.117.179:9001/mqtt', 'clientId');

      client.onConnectionLost = (responseObject) => {
          if (responseObject.errorCode !== 0) {
              console.log('Connection lost:', responseObject.errorMessage);
          }
      };

      client.onMessageArrived = (msg) => {
          console.log('New message:', msg.payloadString);
      };

      client.connect({
          onSuccess: () => {
              console.log('Connection successful');
          },
          onFailure: (error) => {
              console.error('Connection failedasd:', error);
          },
          useSSL: false,
          mqttVersion: 4,
      });

      return client;
  } catch (error) {
      console.error('Error setting up the MQTT client:', error);
  }
};


export default createClient;
