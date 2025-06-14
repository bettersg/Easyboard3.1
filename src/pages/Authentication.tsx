import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import EasyboardTextInput from '../common/components/EasyboardTextInput'
import EasyboardButton from '../common/components/EasyboardButton'
import { RootStackParamList } from '../types/RootStackParamList.type'
import auth from '@react-native-firebase/auth'
import { useAuth } from '../contexts/AppContext'

type Props = NativeStackScreenProps<RootStackParamList, 'Authentication'>

const Authentication = ({ navigation }: Props) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setConfirmation } = useAuth();

  const handleSendOTP = async () => {
    if (phoneNumber.length !== 8) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return
    }
    setIsLoading(true)
    try {
      // Format phone number to E.164 format
      const formattedPhone = `65${phoneNumber}`;
      // Send OTP
      const confirmation = await auth().signInWithPhoneNumber(`+${formattedPhone}`);
      // Store confirmation in context
      setConfirmation(confirmation);
      // Navigate to OTP verification screen
      navigation.navigate('OTPVerification', {
        phoneNumber: formattedPhone
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to EasyBoard</Text>
          <Text style={styles.subtitle}>Please enter your phone number to login</Text>
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
      </View>

      <View style={styles.buttonContainer}>
        <EasyboardButton
          title="Login"
          onPress={handleSendOTP}
          disabled={phoneNumber.length !== 8 || isLoading}
        />
        <TouchableOpacity 
          style={styles.registerLink}
          onPress={() => navigation.navigate('Registration')}
        >
          <Text style={styles.registerText}>New user? Register here</Text>
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
  buttonContainer: {
    marginBottom: 20,
  },
  registerLink: {
    marginTop: 10,
    alignItems: 'center',
  },
  registerText: {
    color: '#007AFF',
    fontSize: 16,
  },
})

export default Authentication 