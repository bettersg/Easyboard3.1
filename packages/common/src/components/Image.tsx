import { cssInterop } from 'nativewind'
import type { ComponentProps } from 'react'
import { SolitoImage } from 'solito/image'

const TmpImage = cssInterop(SolitoImage, {
  className: 'style'
})

export const Image = (props: ComponentProps<typeof TmpImage>) => {
  return <TmpImage {...props} />
}

Image.displayName = 'Image'
