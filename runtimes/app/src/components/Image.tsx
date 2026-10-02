import { Image as ExpoImage, type ImageContentFit } from 'expo-image'
import { cssInterop } from 'nativewind'

cssInterop(ExpoImage, {
  className: 'style'
})

interface ImageProps {
  src: string
  alt?: string
  width: number
  height: number
  contentFit?: ImageContentFit
}

export const Image = ({ src, width, height, ...props }: ImageProps) => {
  return (
    <ExpoImage source={{ uri: src }} style={{ width, height }} {...props} />
  )
}

Image.displayName = 'Image'
