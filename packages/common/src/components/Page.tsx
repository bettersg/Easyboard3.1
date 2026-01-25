import { type ReactNode } from 'react'
import { SafeAreaView } from 'react-native'
import { ScrollView, View } from '.'

interface Props {
  children: ReactNode
  disableScroll?: boolean
  className?: string
}

export const Page = ({ children, disableScroll, className = '' }: Props) =>
  disableScroll ? (
    <View
      className={[
        'bg-[#F4F5F6] flex-1 px-4 py-4 justify-between',
        className
      ].join(' ')}
    >
      <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
    </View>
  ) : (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F5F6' }}>
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          paddingHorizontal: 16,
          paddingVertical: 16,
          justifyContent: 'space-between'
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        className={className}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  )
