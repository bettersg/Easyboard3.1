import { cssInterop } from 'nativewind'
import { Text as RNText, type TextProps as RNTextProps } from 'react-native'

export interface TextProps extends RNTextProps {
  className?: string
}

const MappedText = cssInterop(RNText, {
  className: 'style'
})

export const Text = ({ className, ...props }: TextProps) => {
  return <MappedText {...props} className={className} />
}
