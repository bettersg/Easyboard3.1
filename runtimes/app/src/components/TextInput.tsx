import { cssInterop } from 'nativewind'
import React, { useImperativeHandle, useRef } from 'react'
import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps
} from 'react-native'

export interface TextInputProps extends RNTextInputProps {
  className?: string
}

const MappedTextInput = cssInterop(RNTextInput, {
  className: 'style'
})

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  ({ className, ...props }, ref) => {
    const innerRef = useRef<RNTextInput>(null)

    useImperativeHandle(ref, () => innerRef.current as RNTextInput, [])

    const MappedComponent = MappedTextInput as React.ComponentType<
      TextInputProps & { ref?: React.Ref<RNTextInput> }
    >

    return <MappedComponent {...props} ref={innerRef} className={className} />
  }
)

TextInput.displayName = 'TextInput'
