import { StyleSheet, Text, View } from 'react-native';

type ValueProps = {
  label: string;
  value: string;
};

const Value = ({ label, value }: ValueProps) => (
  <View>
    <Text>{label}</Text>
    <Text>{value}</Text>
  </View>
);

export default Value;