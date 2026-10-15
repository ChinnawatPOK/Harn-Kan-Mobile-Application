import { StyleSheet, Text, View } from 'react-native';

type TabPlaceholderScreenProps = {
  description: string;
  title: string;
};

export function TabPlaceholderScreen({ title, description }: TabPlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#171321',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: '#898594',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
});
