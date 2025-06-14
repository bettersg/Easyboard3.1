import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/RootStackParamList.type'
import { useState } from 'react'
import auth from '@react-native-firebase/auth'
import { useAuth } from '../contexts/AppContext'
import { getUserData } from '../services/userService'
import EasyboardTextInput from '../common/components/EasyboardTextInput'
import EasyboardButton from '../common/components/EasyboardButton'

type Props = NativeStackScreenProps<RootStackParamList, 'Registration'>

type UserType = 'PWID' | 'CAREGIVER'

const Registration = ({ navigation }: Props) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [userType, setUserType] = useState<UserType>('PWID')
  const [isLoading, setIsLoading] = useState(false)
  const { setConfirmation } = useAuth()

  const handleSendOTP = async () => {
    if (phoneNumber.length !== 8) {
      Alert.alert('Error', 'Please enter a valid phone number')
      return
    }
    setIsLoading(true)
    try {
      // Format phone number to E.164 format
      const formattedPhone = `65${phoneNumber}`

      // Check if user already exists
      const existingUser = await getUserData(formattedPhone)
      if (existingUser) {
        Alert.alert('Registration Failed', `This phone number is already registered`)
        return
      }

      // Send OTP
      const confirmation = await auth().signInWithPhoneNumber(`+${formattedPhone}`)
      // Store confirmation in context
      setConfirmation(confirmation)
      // Navigate to OTP verification screen
      navigation.navigate('OTPVerification', {
        phoneNumber: formattedPhone,
        userType,
      })
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Register for EasyBoard</Text>
          <Text style={styles.subtitle}>Please enter your phone number to continue</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <EasyboardTextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            maxLength={8}
          />
        </View>

        <View style={styles.userTypeContainer}>
          <Text style={styles.userTypeLabel}>I am a:</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioOption, userType === 'PWID' && styles.radioSelected]}
              onPress={() => setUserType('PWID')}
            >
              <View style={[styles.radioCircle, userType === 'PWID' && styles.radioCircleSelected]}>
                {userType === 'PWID' && <View style={styles.radioInnerCircle} />}
              </View>
              <Text style={[styles.radioText, userType === 'PWID' && styles.radioTextSelected]}>
                PWID
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.radioOption, userType === 'CAREGIVER' && styles.radioSelected]}
              onPress={() => setUserType('CAREGIVER')}
            >
              <View style={[styles.radioCircle, userType === 'CAREGIVER' && styles.radioCircleSelected]}>
                {userType === 'CAREGIVER' && <View style={styles.radioInnerCircle} />}
              </View>
              <Text style={[styles.radioText, userType === 'CAREGIVER' && styles.radioTextSelected]}>
                Caregiver
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <EasyboardButton
          title="Register"
          onPress={handleSendOTP}
          disabled={phoneNumber.length !== 8 || isLoading}
        />
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Authentication')}
        >
          <Text style={styles.loginText}>Have an account? Login here</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  userTypeContainer: {
    marginBottom: 20,
  },
  userTypeLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  radioSelected: {
    backgroundColor: '#f0f0f0',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: '#007AFF',
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  radioText: {
    fontSize: 16,
    color: '#666',
  },
  radioTextSelected: {
    color: '#007AFF',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  loginLink: {
    marginTop: 10,
    alignItems: 'center',
  },
  loginText: {
    color: '#007AFF',
    fontSize: 16,
  },
})

export default Registration 