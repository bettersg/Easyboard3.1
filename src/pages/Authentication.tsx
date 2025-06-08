import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import EasyboardTextInput from '../common/components/EasyboardTextInput'
import EasyboardButton from '../common/components/EasyboardButton'
import { RootStackParamList } from '../types/RootStackParamList.type'

type Props = NativeStackScreenProps<RootStackParamList, 'Authentication'>

type UserType = 'PWID' | 'CAREGIVER'

const Authentication = ({ navigation }: Props) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [userType, setUserType] = useState<UserType>('PWID')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendOTP = async () => {
    if (phoneNumber.length < 8) {
      return
    }
    
    setIsLoading(true)
    try {
      // TODO: Implement OTP sending logic here
      // After successful OTP send, navigate to OTP verification screen
      navigation.navigate('OTPVerification', {
        phoneNumber,
        userType
      })
    } catch (error) {
      console.error('Error sending OTP:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to EasyBoard</Text>
          <Text style={styles.subtitle}>Please enter your phone number to continue</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <EasyboardTextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            maxLength={10}
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
          title="Send OTP"
          onPress={handleSendOTP}
          disabled={phoneNumber.length < 8 || isLoading}
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
    marginTop: 40,
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
    color: '#666',
    marginBottom: 32
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f8f8'
  },
  userTypeContainer: {
    marginBottom: 32
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 140
  },
  radioSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF'
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  radioCircleSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF'
  },
  radioInnerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff'
  },
  radioText: {
    fontSize: 16,
    color: '#000'
  },
  radioTextSelected: {
    color: '#007AFF',
    fontWeight: '600'
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 8
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingBottom: 40
  }
})

export default Authentication 