import { Phone, Pin, Users } from '@nandorojo/iconic'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  Platform,
  RefreshControl
} from 'react-native'
import { useSafeArea } from 'react-native-safe-area-context'
import { useRouter } from 'solito/navigation'
import { Button, ScrollView, Text, View } from '../../components'
import { getUserStorage } from '../../services/storageService'
import { getPWIDsByCaregiverPhone } from '../../services/userService'
import type { PWIDUser } from '../../types'

export function CaregiverHome() {
  const { top } = useSafeArea()
  const router = useRouter()
  const [pwids, setPwids] = useState<PWIDUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadPWIDs = useCallback(async () => {
    try {
      const userStorage = await getUserStorage()
      if (userStorage?.phoneNumber) {
        const pwidList = await getPWIDsByCaregiverPhone(userStorage.phoneNumber)
        setPwids(pwidList)
      }
    } catch (error) {
      console.error('Error loading PWIDs:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadPWIDs()
  }, [loadPWIDs])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadPWIDs()
  }, [loadPWIDs])

  const handleCall = useCallback((pwidPhone: string) => {
    if (pwidPhone) {
      Linking.openURL(`tel:${pwidPhone}`).catch((err) =>
        console.error('Failed to open URL:', err)
      )
    }
  }, [])

  const handleTrackPWID = useCallback(
    (pwidPhone: string, pwidName: string) => {
      router.push(`/track-pwid?phone=${pwidPhone}&name=${pwidName}`)
    },
    [router]
  )

  const renderPWIDItem = (item: PWIDUser) => {
    const isSharing = !!item.location?.isSharing
    const statusColor = isSharing ? '#CBF4DF' : '#F7CBC8'
    const statusTextColor = isSharing ? '#209D5E' : '#E13F33'
    const statusText = isSharing ? 'Online' : 'Offline'

    return (
      <View
        key={item.phoneNumber}
        className='bg-white rounded-xl p-4 mb-4 w-full flex-1'
      >
        <View className='flex-row justify-between items-start mb-3'>
          <View className='flex-1 flex flex-col'>
            <Text className='text-xl font-semibold text-[#414852] mb-1'>
              {item.name}
            </Text>
            <Text className='text-sm text-[#677281] mb-1'>
              Updated{' '}
              {item.location
                ? new Date(item.location.updatedAt).toLocaleTimeString()
                : 'unknown'}
            </Text>
          </View>
          <View
            className='flex-row items-center px-2 py-2 rounded-[100px]'
            style={{ backgroundColor: statusColor }}
          >
            <Pin width={20} height={20} color={statusTextColor} />
            <Text
              className='text-sm font-bold'
              style={{ color: statusTextColor }}
            >
              {statusText}
            </Text>
          </View>
        </View>

        <View className='flex-row items-center mt-0.5 w-full gap-2'>
          <Button
            className='flex-row items-center flex-1 p-1.5 h-[3rem] justify-center gap-1 border-[#007AFF]'
            onPress={() => handleCall(item.phoneNumber)}
            variant='outline'
            disabled={!item.phoneNumber}
          >
            <Phone width={30} height={30} color='#007AFF' />
            <Text className='font-bold text-base text-[#007AFF]'>Call</Text>
          </Button>
          <Button
            className='flex-row items-center flex-1 p-1.5 h-[3rem] justify-center gap-1'
            onPress={() => handleTrackPWID(item.phoneNumber, item.name)}
            disabled={!item.phoneNumber}
          >
            <Pin width={30} height={30} color='#F4F5F6' />
            <Text className='font-bold text-base text-[#F4F5F6]'>Locate</Text>
          </Button>
        </View>
      </View>
    )
  }

  const renderEmptyState = () => (
    <View className='items-center justify-center py-20'>
      <Users width={64} height={64} color='#ccc' />
      <Text className='text-xl font-semibold text-[#677281] mt-4'>
        No PWIDs Found
      </Text>
      <Text className='text-base text-[#677281] text-center mt-2 px-4'>
        PWIDs you&apos;re assigned to will appear here once they register and
        link to your phone number.
      </Text>
    </View>
  )

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' color='#3F98F8' />
      </View>
    )
  }

  return (
    <View
      className='justify-start items-center px-6 w-screen flex-1 flex gap-6'
      style={{ paddingTop: Platform.OS === 'web' ? 24 : top + 16 }}
    >
      {/* Header */}
      <View className='flex-row items-center justify-between w-full'>
        <Text className='text-[2rem] font-bold text-[#414852]'>Dashboard</Text>
      </View>

      {/* Content */}
      <ScrollView
        className='flex-1 w-full'
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {pwids.length > 0 ? (
          <View className='gap-0'>{pwids.map(renderPWIDItem)}</View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  )
}
