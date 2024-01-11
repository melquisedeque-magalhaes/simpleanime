import { Slot, SplashScreen } from 'expo-router'

import '../../global.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_400Regular_Italic,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect } from 'react'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

export default function AppLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular,
    Roboto_400Regular_Italic,
    Roboto_500Medium,
    Roboto_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  // Prevent rendering until the font has loaded or an error was returned
  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" translucent backgroundColor="#0B101A" />
      <SafeAreaView style={{ flex: 1 }}>
        <Slot />
      </SafeAreaView>
    </QueryClientProvider>
  )
}
