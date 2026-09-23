import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { NotificationsProvider } from "./notification-context"
import { ThemeProvider } from "./theme-context"

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <ThemeProvider>
        <NotificationsProvider>
          <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="welcome" options={{ headerShown: false }} />
              <Stack.Screen name="signup" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
              <Stack.Screen name="home" options={{ headerShown: false }} />
              <Stack.Screen name="ai-camera" options={{ headerShown: false }} />
              <Stack.Screen name="learn" options={{ headerShown: false }} />
              <Stack.Screen name="lesson/alphabet" options={{ headerShown: false }} />
              <Stack.Screen name="lesson/numbers" options={{ headerShown: false }} />
              <Stack.Screen name="lesson/greetings" options={{ headerShown: false }} />
              <Stack.Screen name="lesson/weather" options={{ headerShown: false }} />
              <Stack.Screen name="lesson/narrative" options={{ headerShown: false }} />
              <Stack.Screen name="lesson/classifiers" options={{ headerShown: false }} />
              <Stack.Screen name="lesson/classifiers-cl" options={{ headerShown: false }} />
              <Stack.Screen name="lesson/nms" options={{ headerShown: false }} />
              <Stack.Screen name="lesson/deaf-slang" options={{ headerShown: false }} />
              <Stack.Screen name="lesson/quiz" options={{ headerShown: false }} />
              <Stack.Screen name="goals" options={{ headerShown: false }} />
              <Stack.Screen name="game" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="profile-progress" options={{ headerShown: false }} />
              <Stack.Screen name="profile-activity" options={{ headerShown: false }} />
              <Stack.Screen name="admin" options={{ headerShown: false }} />
              <Stack.Screen name="notifications" options={{ headerShown: false }} />
              <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
              <Stack.Screen name="daily-quest" options={{ headerShown: false }} />
              <Stack.Screen name="info" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
              <Stack.Screen name="help-support" options={{ headerShown: false }} />
              <Stack.Screen name="display-accessibility" options={{ headerShown: false }} />
              <Stack.Screen name="settings-privacy" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
          </Stack>
        </NotificationsProvider>
      </ThemeProvider>
    </>
  )
}