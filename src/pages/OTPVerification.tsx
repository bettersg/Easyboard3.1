import { View, Text, StyleSheet, Alert } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/RootStackParamList.type'
import { useState } from 'react'
import { useAuth } from '../contexts/AppContext'
import { createUser, getUserAppData } from '../services/userService'
import { setUserStorage } from '../services/storageService'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'
import EasyboardTextInput from '../common/components/EasyboardTextInput'
import EasyboardButton from '../common/components/EasyboardButton'

type Props = NativeStackScreenProps<RootStackParamList, 'OTPVerification'>

export default function OTPVerification({ navigation, route }: Props) {
  const { phoneNumber, userType, isRegistration } = route.params
  const { confirmation, setAuthentication } = useAuth()
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleVerifyOTP = async () => {
    if (!confirmation) {
      Alert.alert('Error', 'No confirmation found. Please try again.')
      return
    }

    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP')
      return
    }
    setIsLoading(true)
    try {
      // Confirm the OTP
      const userCredential = await confirmation.confirm(otp)

      if (!userCredential) {
        throw new Error('Failed to verify OTP')
      }

      // If this is a registration flow, create new user
      if (isRegistration) {
        await createUser(phoneNumber, userType, userCredential.user.uid)
      }

      // Store user data in local storage
      await setUserStorage({ phoneNumber, userType, loggedAt: Date.now() })

      // After successful login/registration, fetch appData and cache locally
      let hasAppData = false
      try {
        const appData = await getUserAppData(phoneNumber)
        if (appData) {
          hasAppData = true
          await SecureStore.setItemAsync(
            Constants?.expoConfig?.extra?.settingsStoredKey,
            JSON.stringify(appData)
          )
        }
      } catch (e) {
        // Non-fatal if appData missing; continue to app
      }

      // Update authentication state - this will trigger App.tsx to re-render with the correct stack
      setAuthentication(true, userType, isRegistration)
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter Verification</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to +{phoneNumber}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>OTP Code</Text>
          <EasyboardTextInput
            value={otp}
            onChangeText={setOtp}
            placeholder='Enter 6-digit code'
            keyboardType='number-pad'
            maxLength={6}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <EasyboardButton
          title='Verify OTP'
          onPress={handleVerifyOTP}
          disabled={otp.length !== 6 || isLoading}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20
  },
  content: {
    flex: 1,
    justifyContent: 'center'
  },
  header: {
    marginBottom: 30
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 17,
    color: '#4D4D4D',
    textAlign: 'center',
    fontWeight: '400'
  },
  inputContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500'
  },
  buttonContainer: {
    marginBottom: 20
  }
})
