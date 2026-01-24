import { Camera, Pin } from '@nandorojo/iconic'
import * as ImagePicker from 'expo-image-picker'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import {
  Modal,
  Platform,
  Animated as RNAnimated,
  useWindowDimensions
} from 'react-native'
import ActionSheet, { type ActionSheetRef } from 'react-native-actions-sheet'
import { useSafeArea } from '../provider'
import { uploadLocationPhoto } from '../services/storageService'
import type { MarkerData } from '../stores/onboardingStore'
import { Animated, BackButton, Button, Image, InputField, Text, View } from '.'
import GoogleMapView from './mapView/GoogleMapView'

interface LocationInputProps {
  onLocationSelect: (location: MarkerData) => void
  value: MarkerData | null
  className?: string
  locationType?: 'Home' | 'Work' | 'School'
}

export interface LocationInputRef {
  open: () => void
}

export const LocationInput = forwardRef<LocationInputRef, LocationInputProps>(
  ({ onLocationSelect, value, className, locationType = 'home' }, ref) => {
    const [isModalOpen, setModalOpenState] = useState(false)
    const [location, setSelectedLocation] = useState<MarkerData | null>(null)
    const [step, setStep] = useState(0)
    const { bottom } = useSafeArea()
    const { width } = useWindowDimensions()
    const actionSheetRef = useRef<ActionSheetRef>(null)
    const slideAnim = useRef(new RNAnimated.Value(0)).current

    useImperativeHandle(ref, () => ({
      open: () => {
        setModalOpenState(true)
        setStep(0)
        slideAnim.setValue(0)
      }
    }))

    useEffect(() => {
      setSelectedLocation(value)
    }, [value])

    useEffect(() => {
      if (location?.description && step === 0) {
        console.log('location', location)
        actionSheetRef.current?.show()
      }
    }, [location, step])

    const onLocationMarkerDrop = useCallback(function (
      locationMarker: MarkerData
    ) {
      setSelectedLocation(locationMarker)
    }, [])

    const pickImage = useCallback(async () => {
      try {
        // Request permissions
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          console.warn('Permission to access media library was denied')
          return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: false,
          quality: 1,
          exif: false
        })

        if (result && !result.canceled && result.assets[0]) {
          const photoUri = result.assets[0].uri

          let locationImageKey: string | undefined

          // On web, upload blob URLs to Firebase Storage
          if (Platform.OS === 'web' && photoUri.startsWith('blob:')) {
            try {
              // Type assertion needed because TypeScript sees native signature
              const uploadLocationPhotoWeb = uploadLocationPhoto as (
                imageUri: string,
                locationType: string
              ) => Promise<string>
              locationImageKey = await uploadLocationPhotoWeb(
                photoUri,
                locationType
              )
            } catch (uploadError) {
              console.error(
                'Error uploading image to Firebase Storage:',
                uploadError
              )
              // Continue with no key if upload fails
            }
          }

          setSelectedLocation((prev) => {
            if (prev) {
              return {
                ...prev,
                photoUri: result?.assets?.[0]?.uri,
                locationImageKey
              }
            }
            return prev
          })
        }
      } catch (error) {
        console.error('Error picking image:', error)
      }
    }, [locationType])

    const goToStep = (newStep: number) => {
      setStep(newStep)
      RNAnimated.timing(slideAnim, {
        toValue: -newStep * width,
        duration: 300,
        useNativeDriver: true
      }).start()
    }

    const handleLocationConfirm = () => {
      if (location != null) {
        goToStep(1)
      }
    }

    const handleClose = () => {
      if (location != null && step === 1) {
        onLocationSelect(location)
      }
      setModalOpenState(false)
      setStep(0)
      slideAnim.setValue(0)
    }

    const handleBackPress = () => {
      if (step === 0) {
        handleClose()
      } else {
        goToStep(step - 1)
      }
    }

    return (
      <View className={className}>
        <Modal
          presentationStyle='pageSheet'
          statusBarTranslucent
          animationType='slide'
          visible={isModalOpen}
          onRequestClose={handleClose}
          onDismiss={handleClose}
        >
          <View className='flex-1 bg-white'>
            {/* Header */}
            <View className='flex-row items-center justify-start px-6 py-4 gap-4'>
              <BackButton
                onPress={handleBackPress}
                textClassName='text-[40px] mb-1'
              />
              <Text className='text-2xl font-bold text-[#414852]'>
                {step === 0 ? 'Enter address' : 'Enter place details'}
              </Text>
            </View>

            {/* Slider Container - clips overflow */}
            <View className='flex-1 overflow-hidden'>
              {/* Sliding Inner Container */}
              <Animated.View
                className='flex-row h-full'
                style={{
                  width: width * 2,
                  transform: [{ translateX: slideAnim }]
                }}
              >
                {/* Page 1: Map */}
                <View className='h-full' style={{ width }}>
                  <GoogleMapView
                    onLocationMarkerDrop={onLocationMarkerDrop}
                    value={location}
                    initialCenter={{
                      latitude: 1.3521,
                      longitude: 103.8198
                    }}
                  />
                  <ActionSheet
                    ref={actionSheetRef}
                    backgroundInteractionEnabled={true}
                  >
                    <View className={`bg-white p-4 rounded-xl gap-6`}>
                      <View className='flex-col items-start justify-between'>
                        {location?.description
                          .split(',')
                          .map((section, index) => {
                            return (
                              <Text
                                key={index}
                                className={`text-base text-[#414852] ${index === 0 ? 'font-bold' : ''}`}
                              >
                                {section.trim()}
                              </Text>
                            )
                          })}
                      </View>
                      <Button
                        text='Save this location'
                        onPress={handleLocationConfirm}
                      />
                    </View>
                  </ActionSheet>
                </View>

                {/* Page 2: Place Details */}
                <View
                  className={`web:h-[calc(100dvh-83px)] h-full flex-col items-center justify-between p-6 bg-[#F4F5F6]`}
                  style={{ width }}
                >
                  <View className='flex-col items-center justify-start gap-6 w-full'>
                    <Button
                      onPress={pickImage}
                      className='h-[150px] w-full bg-[#EBF4FF] flex items-center justify-center'
                      variant='text'
                    >
                      {location?.photoUri ? (
                        <View className='w-full h-[150px] rounded-md overflow-hidden flex items-center justify-center'>
                          <Image
                            src={location?.photoUri}
                            alt={location?.description || 'Location Photo'}
                            width={550}
                            height={150}
                            contentFit='cover'
                          />
                        </View>
                      ) : (
                        <View className='flex-row items-center justify-center gap-2'>
                          <Camera
                            width={24}
                            height={24}
                            stroke='#3F98F8'
                            color='#3F98F8'
                          />
                          <Text className='text-base font-bold text-[#3F98F8]'>
                            Add image (optional)
                          </Text>
                        </View>
                      )}
                    </Button>
                    <View className='flex-col items-center justify-center gap-4 w-full'>
                      <View className='flex-col items-start justify-between gap-2 w-full'>
                        <Text className='text-base font-bold text-[#414852]'>
                          Name
                        </Text>
                        <InputField
                          className='w-full text-base font-bold text-[#414852]'
                          placeholder={locationType}
                          editable={false}
                        />
                      </View>
                      <View className='flex-col items-start justify-center gap-2 w-full'>
                        <Text className='text-base font-bold text-[#414852]'>
                          Address
                        </Text>
                        <View className='flex-row items-center justify-start gap-2 bg-[#FCFCFD] w-full border border-[#DCDFE3] rounded-md p-4'>
                          <Pin width={24} height={24} />
                          <Text className='text-base font-normal text-[#414852] w-[calc(100%-48px)]'>
                            {location?.description}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <Button
                    text='Save'
                    onPress={handleClose}
                    className='w-full'
                    style={{ marginBottom: bottom }}
                  />
                </View>
              </Animated.View>
            </View>
          </View>
        </Modal>
      </View>
    )
  }
)

LocationInput.displayName = 'LocationInput'
