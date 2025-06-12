import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/RootStackParamList.type'
import EasyboardButton from '../common/components/EasyboardButton'
import EasyboardTextInput from '../common/components/EasyboardTextInput'
import { useState } from 'react'

type Props = NativeStackScreenProps<RootStackParamList, 'OTPVerification'>

export default function OTPVerification({ navigation, route }: Props) {
  const { phoneNumber, userType, confirmation } = route.params;
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP')
      return;
    }
    setIsLoading(true);
    try {
      // Confirm the OTP
      const userCredential = await confirmation.confirm(otp);

      if (!userCredential) {
        throw new Error('Failed to verify OTP')
      }

      // Store user type in user profile
      await userCredential.user.updateProfile({
        displayName: userType
      });

      // Navigate to appropriate screen based on user type
      if (userType === 'CAREGIVER') {
        navigation.navigate('CaregiverMain');
      } else {
        navigation.navigate('Introduction');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP. Please try again.')
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter Verification</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to {phoneNumber}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>OTP Code</Text>
          <EasyboardTextInput
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <TouchableOpacity style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <Text style={styles.resendLink}>Resend OTP</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <EasyboardButton
          title="Verify OTP"
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
    backgroundColor: '#fff'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  header: {
    marginTop: 20,
    marginBottom: 32
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  },
  inputContainer: {
    marginBottom: 24
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 8
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  resendText: {
    fontSize: 14,
    color: '#666'
  },
  resendLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600'
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingBottom: 40
  }
}) 