import { cssInterop } from 'nativewind'
import React, { useImperativeHandle, useRef } from 'react'
import { type FlatListProps, FlatList as RNFlatlist } from 'react-native'

export interface FlatListDataType {
  id: string
  component: JSX.Element
}

const MappedFlatList = cssInterop(RNFlatlist<FlatListDataType>, {
  className: 'style'
})

export interface FlatlistProps extends FlatListProps<FlatListDataType> {
  className?: string
}

export const Flatlist = React.forwardRef<
  RNFlatlist<FlatListDataType>,
  FlatlistProps
>(({ className, ...props }, ref) => {
  const innerRef = useRef<RNFlatlist<FlatListDataType>>(null)

  useImperativeHandle(
    ref,
    () => innerRef.current as RNFlatlist<FlatListDataType>,
    []
  )

  const MappedComponent = MappedFlatList as React.ComponentType<
    FlatlistProps & { ref?: React.Ref<RNFlatlist<FlatListDataType>> }
  >

  return <MappedComponent {...props} ref={innerRef} className={className} />
})

Flatlist.displayName = 'FlatList'
