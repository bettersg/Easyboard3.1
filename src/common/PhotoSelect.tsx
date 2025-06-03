import * as ImagePicker from 'expo-image-picker'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { View, Image, ScrollView } from 'react-native'

import ImageUploadButton from './components/ImageUploadButton'

interface Props {
  imgChange: (imgUri: string | string[]) => void
  allowMultiple?: boolean
  selectionLimit?: number
  value: string | string[] | null
  additionalClassName?: string
}

const PhotoSelect = ({
  imgChange,
  allowMultiple,
  selectionLimit,
  value,
  additionalClassName
}: Props) => {
  const [imgUri, setImgUri] = useState<string | null>('')
  const [multiImgUri, setMultiImgUri] = useState<string[] | null>([])

  useEffect(() => {
    if (allowMultiple) {
      setMultiImgUri(value as string[])
    } else {
      if (value) {
        setImgUri(value as string)
      }
    }
  }, [value])

  const fileName = useMemo(() => {
    if (imgUri) {
      const strArr = imgUri?.split('/') ?? []
      return strArr[strArr.length - 1]
    }
    if (allowMultiple && multiImgUri) {
      const fileNames = multiImgUri?.map((file) => {
        const strArr = file.split('/')
        return strArr[strArr.length - 1]
      })
      if (fileNames) {
        return fileNames.join(', ')
      }
    }
  }, [imgUri, multiImgUri, allowMultiple])

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: allowMultiple,
        selectionLimit: allowMultiple ? selectionLimit : 0,
        quality: 1,
        exif: false, // Disable EXIF data to reduce memory usage
      })

      if (result && !result.canceled) {
        if (allowMultiple) {
          const imgUris = result.assets.map((img) => img.uri)
          setMultiImgUri(imgUris)
          imgChange(imgUris)
        } else {
          if (result.assets[0]) {
            setImgUri(result.assets[0].uri)
            imgChange(result.assets[0].uri)
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error)
    }
  }, [allowMultiple, selectionLimit, imgChange])

  // Render Images if available
  const renderUploadedImages = useMemo(() => {
    // Multiple Images
    if (allowMultiple && multiImgUri && multiImgUri.length > 0) {
      return (
        <ScrollView 
          horizontal 
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          removeClippedSubviews={true} // Optimize memory usage
        >
          {multiImgUri.map(
            (imgUri) =>
              imgUri.length > 0 && (
                <View key={imgUri} className="mr-4">
                  <View className="overflow-hidden rounded-lg border-1 border-white bg-white p-1 shadow-sm">
                    <Image
                      source={{ uri: imgUri }}
                      className="h-24 w-24 rounded-md"
                      resizeMode="cover"
                      fadeDuration={0} // Disable fade animation for better performance
                    />
                  </View>
                </View>
              )
          )}
        </ScrollView>
      )
    }
    // Single Image
    if (imgUri != null && imgUri.length > 0 && !allowMultiple) {
      return (
        <View className="mt-4">
          <View className="overflow-hidden rounded-lg border-1 border-white bg-white p-1 shadow-sm">
            <Image
              source={{ uri: imgUri }}
              className="h-40 w-full rounded-md"
              resizeMode="cover"
              fadeDuration={0} // Disable fade animation for better performance
            />
          </View>
        </View>
      )
    }
  }, [imgUri, allowMultiple, multiImgUri])

  return (
    <View className={additionalClassName}>
      <ImageUploadButton 
        onPress={pickImage} 
        value={fileName}
        additionalClassName="rounded-lg border-[1px] border-gray-300 bg-white shadow-sm"
      />
      {renderUploadedImages}
    </View>
  )
}

export default PhotoSelect
