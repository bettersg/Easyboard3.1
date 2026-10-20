import React, { useImperativeHandle, useRef } from 'react'
import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
  type TextInputInstance
} from 'react-native'

export interface TextInputProps extends RNTextInputProps {
  className?: string
}

const MappedTextInput = RNTextInput

export const TextInput = React.forwardRef<TextInputInstance, TextInputProps>(
  ({ className, ...props }, ref) => {
    const innerRef = useRef<TextInputInstance>(null)

    useImperativeHandle(ref, () => innerRef.current as TextInputInstance, [])

    const MappedComponent = MappedTextInput as React.ComponentType<
      TextInputProps & { ref?: React.Ref<TextInputInstance> }
    >

    return <MappedComponent {...props} ref={innerRef} className={className} />
  }
)

TextInput.displayName = 'TextInput'
