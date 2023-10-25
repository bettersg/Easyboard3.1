import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import call from 'react-native-phone-call'

const useCallCaregiver = () => {
  return async () => {
    try {
      const storedData = await SecureStore.getItemAsync(
        Constants?.expoConfig?.extra?.settingsStoredKey
      )
      const number = JSON.parse(storedData ?? '').careGiverPhoneNumber
      await call({
        number, // String value with the number to call
        prompt: true, // Optional boolean property. Determines if the user should be prompted prior to the call
        skipCanOpen: true, // Skip the canOpenURL check
      })
    } catch (e) {
      console.error(e)
    }
  }
}
export default useCallCaregiver
