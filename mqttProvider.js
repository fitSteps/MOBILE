import React, { createContext, useState, useEffect } from 'react';
import createClient from './mqttClient'; // Import your MQTT client creation logic

export const MQTTContext = createContext();

export const MQTTProvider = ({ children }) => {
  const [client, setClient] = useState(null);

  useEffect(() => {
    const mqttClient = createClient();
    setClient(mqttClient);

    return () => {
      mqttClient.disconnect(); // Ensure the client disconnects on app unload
    };
  }, []);

  return (
    <MQTTContext.Provider value={{ client }}>
      {children}
    </MQTTContext.Provider>
  );
};
