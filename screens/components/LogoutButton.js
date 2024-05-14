import React from 'react';
import { Button } from 'react-native';

function LogoutButton({ onLogout }) {
  return <Button title="Logout" onPress={onLogout} />;
}

export default LogoutButton;
