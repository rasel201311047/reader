import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack>
    <Stack.Screen name='index' options={{ headerShown: true }} />
    <Stack.Screen name='audio1' options={{ headerShown: true }} />
    <Stack.Screen name='audio2' options={{ headerShown: true }} />
  </Stack>;
}
