'use client'

import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, useWindowDimensions, View } from 'react-native'
import { Text } from '../../components'
import {
  ActionButton,
  AppFrame,
  ProgressBar,
  ReadAloudButton,
  ScenePanel,
  Toast
} from '../../components/ui'
import { usePreferences } from '../../contexts/PreferencesContext'
import { useLocationSharing } from '../../contexts/LocationSharingContext'
import { useCallCaregiver } from '../../hooks/useCallCaregiver'
import { useToast } from '../../hooks/useToast'
import { findJourneyForDestination } from '../../services/journeyService'
import {
  getActiveTrip,
  setActiveTrip,
  type ActiveTrip,
  type TripStage
} from '../../services/tripStore'
import { getUserStorage } from '../../services/storageService'
import { getUserData, setPWIDActiveTrip } from '../../services/userService'
import { colors, font, radius, shadow, space } from '../../theme/tokens'
import type { Journey, PWIDUser } from '../../types'
import {
  STAGE_COPY,
  STAGE_INDEX,
  getStoryStepIcon,
  getStorySteps,
  toTripStage,
  type ScreenStage,
  type StoryStep
} from './tripData'

interface Profile {
  name: string
  phoneNumber: string
  caregiverName: string
  caregiverPhone: string
}

function stageFromTripStage(stage: TripStage): ScreenStage {
  switch (stage) {
    case 'waiting':
      return 'wait'
    case 'boarding':
      return 'board'
    case 'on-bus':
      return 'ride'
    case 'arriving':
      return 'alight'
    case 'arrived':
      return 'arrived'
    default:
      return 'story'
  }
}

export function TripPage() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const { preferences, scale, bodyLine } = usePreferences()
  const { isLocationSharing, setIsLocationSharing } = useLocationSharing()
  const { showToast, message } = useToast()
  const callCaregiver = useCallCaregiver()

  const params = useLocalSearchParams<{
    destinationName?: string
    practice?: string
    stage?: string
  }>()
  const destinationName = params.destinationName || 'Blue Library'
  const initialPractice = params.practice === '1'
  const originName = destinationName === 'Home' ? 'Here' : 'Home'
  const tripTitle =
    destinationName === 'Home' ? 'Going home' : originName === 'Here' ? `To ${destinationName}` : `${originName} to ${destinationName}`
  const isWide = width >= 960

  const existingTrip = useMemo<ActiveTrip | null>(() => getActiveTrip(), [])

  const initialStage = useMemo<ScreenStage>(() => {
    const requested = params.stage as ScreenStage | undefined
    if (requested && requested in STAGE_INDEX) return requested
    if (existingTrip && existingTrip.destination === destinationName) {
      return stageFromTripStage(existingTrip.stage)
    }
    return 'story'
  }, [destinationName, existingTrip, params.stage])

  const [stage, setStage] = useState<ScreenStage>(initialStage)
  const [isPractice, setIsPractice] = useState(initialPractice)
  const [profile, setProfile] = useState<Profile>({
    name: '',
    phoneNumber: '',
    caregiverName: 'your caregiver',
    caregiverPhone: ''
  })
  const [checks, setChecks] = useState({ card: false, battery: false, headphones: false })
  const [journey, setJourney] = useState<Journey | null>(null)
  const [scriptOpen, setScriptOpen] = useState(false)
  const [missedStop, setMissedStop] = useState(false)
  const [busMissed, setBusMissed] = useState(false)
  const startedAt = useRef(existingTrip?.startedAt || 0)
  const tripId = useRef(existingTrip?.id || 'local-trip')

  useEffect(() => {
    const load = async () => {
      const stored = await getUserStorage()
      if (!stored) return
      const pwid = stored as unknown as PWIDUser
      let caregiverName = 'your caregiver'
      if (pwid.caregiverPhone) {
        const caregiver = await getUserData(pwid.caregiverPhone)
        if (caregiver?.name) caregiverName = caregiver.name
      }
      setProfile({
        name: pwid.name?.trim() || '',
        phoneNumber: pwid.phoneNumber || '',
        caregiverName,
        caregiverPhone: pwid.caregiverPhone || ''
      })
    }
    load().catch(error => console.error('Error loading trip profile:', error))
  }, [])

  useEffect(() => {
    if (!profile.phoneNumber) return
    let active = true
    getUserData(profile.phoneNumber)
      .then(data => {
        if (!active) return
        const journeys = (data as PWIDUser | null)?.journeys ?? []
        setJourney(findJourneyForDestination(journeys, destinationName))
      })
      .catch(error => console.error('Error loading journey:', error))
    return () => {
      active = false
    }
  }, [destinationName, profile.phoneNumber])

  useEffect(() => {
    if (stage === 'story') return
    if (isPractice) {
      // Practice is a rehearsal. It must not publish a trip or share location.
      setIsLocationSharing(false)
      return
    }
    if (!startedAt.current) startedAt.current = Date.now()
    if (stage === 'arrived' || preferences.privacyMode === 'paused') {
      setIsLocationSharing(false)
    } else if (!isLocationSharing) {
      setIsLocationSharing(true)
    }
    const trip: ActiveTrip = {
      id: existingTrip?.id || tripId.current,
      travellerName: profile.name || existingTrip?.travellerName || 'Your person',
      travellerPhone: profile.phoneNumber || existingTrip?.travellerPhone || '',
      destination: destinationName,
      origin: originName,
      stage: toTripStage(stage),
      busNumber: journey?.busNumber || '2',
      startedAt: startedAt.current,
      updatedAt: Date.now(),
      caregiverName: profile.caregiverName,
      caregiverPhone: profile.caregiverPhone,
      practice: isPractice
    }
    setActiveTrip(trip)
    if (profile.phoneNumber) {
      setPWIDActiveTrip(profile.phoneNumber, trip).catch(error =>
        console.error('Error syncing active trip:', error)
      )
    }
  }, [destinationName, existingTrip, isLocationSharing, isPractice, journey?.busNumber, originName, preferences.privacyMode, profile, setIsLocationSharing, stage])

  const baseCopy = stage !== 'story' && stage !== 'arrived' ? STAGE_COPY[stage] : null
  const journeyStep = journey?.steps.find(step => step.id === stage)
  const copy = baseCopy
    ? {
        ...baseCopy,
        ...(journeyStep
          ? { title: journeyStep.title, detail: journeyStep.detail }
          : stage === 'alight'
            ? {
                title: `Get off at ${destinationName}`,
                detail: `Press the bell after 7 stops. ${destinationName} is next.`
              }
            : {})
      }
    : null

  const handleCall = useCallback(async () => {
    if (!profile.caregiverPhone) {
      showToast('No caregiver number saved.')
      return
    }
    await callCaregiver()
  }, [callCaregiver, profile.caregiverPhone, showToast])

  const openHelp = useCallback(() => {
    const params = new URLSearchParams({
      destination: destinationName,
      location:
        stage === 'wait'
          ? 'the bus stop'
          : stage === 'board'
            ? 'the bus door'
            : stage === 'ride'
              ? 'the bus'
              : 'the way to your destination',
      caregiverName: profile.caregiverName,
      caregiverPhone: profile.caregiverPhone
    })
    router.navigate(`/help-card?${params.toString()}`)
  }, [destinationName, profile, router, stage])

  const startTrip = (practiceMode = isPractice) => {
    setIsPractice(practiceMode)
    startedAt.current = Date.now()
    if (!practiceMode && preferences.privacyMode !== 'paused') setIsLocationSharing(true)
    setStage('wait')
  }

  const nextStage = () => {
    if (!copy) return
    setStage(copy.next)
    setScriptOpen(false)
    setMissedStop(false)
    setBusMissed(false)
  }

  const storySteps: StoryStep[] = journey?.steps?.length
    ? journey.steps.map(step => ({
        ...step,
        icon: getStoryStepIcon(step.id)
      }))
    : getStorySteps(destinationName)
  const currentStepNumber =
    stage === 'story' || stage === 'arrived'
      ? 0
      : Math.max(1, storySteps.findIndex(step => step.id === stage) + 1)
  const readText = copy ? `${copy.title}. ${copy.detail}` : ''

  return (
    <AppFrame statusLabel={isLocationSharing ? 'Sharing this trip' : 'Sharing off'}>
      <View style={{ gap: space.lg }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Back to trip story'
            onPress={() => (stage === 'story' ? router.navigate('/home') : setStage('story'))}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 }}
          >
            <Ionicons name='arrow-back' size={scale(20)} color={colors.brand} />
            <Text style={{ fontSize: scale(14), fontWeight: '700', color: colors.brand }}>
              {stage === 'story' ? 'Home' : 'Trip story'}
            </Text>
          </Pressable>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap'
            }}
          >
            <View
              style={{
                backgroundColor: isPractice ? colors.warningSoft : colors.brandSoft,
                borderRadius: radius.pill,
                paddingHorizontal: 11,
                paddingVertical: 5
              }}
            >
              <Text
                style={{
                  fontSize: scale(12),
                  fontWeight: '800',
                  color: isPractice ? colors.warning : colors.brand,
                  textTransform: 'uppercase',
                  letterSpacing: 0.4
                }}
              >
                {isPractice ? 'Practice route' : 'Your trip'}
              </Text>
            </View>
            <ReadAloudButton
              text={
                stage === 'story'
                  ? `${tripTitle}. 8 steps. About 25 minutes.`
                  : readText
              }
            />
          </View>
        </View>

        {stage === 'story' ? (
          <StoryView
            title={tripTitle}
            steps={storySteps}
            busNumber={journey?.busNumber || '2'}
            isWide={isWide}
            checks={checks}
            onToggleCheck={key => setChecks(current => ({ ...current, [key]: !current[key] }))}
            onStart={() => startTrip(isPractice)}
            onPractice={() => startTrip(true)}
            onCall={handleCall}
            scale={scale}
            bodyLine={bodyLine}
          />
        ) : stage === 'arrived' ? (
          <ArrivedView
            destinationName={destinationName}
            scale={scale}
            bodyLine={bodyLine}
            onDone={() => {
              setActiveTrip(null)
              if (profile.phoneNumber) {
                setPWIDActiveTrip(profile.phoneNumber, null).catch(error =>
                  console.error('Error clearing active trip:', error)
                )
              }
              router.navigate('/home')
            }}
            onHelp={openHelp}
          />
        ) : (
          <View style={{ flexDirection: isWide ? 'row' : 'column', gap: space.lg, alignItems: 'stretch' }}>
            <View
              style={{
                flex: isWide ? 1.4 : undefined,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.line,
                borderRadius: radius.xl,
                padding: isWide ? 28 : 20,
                gap: 18,
                boxShadow: shadow.card,
                minWidth: 0
              }}
            >
              <ProgressBar
                current={currentStepNumber}
                total={storySteps.length}
                label={`Step ${currentStepNumber} of ${storySteps.length} · ${destinationName}`}
              />
              <ScenePanel
                kind={copy?.scene ?? 'stop'}
                caption={
                  stage === 'wait'
                    ? 'The bus stop near the blue sign'
                    : stage === 'board'
                      ? `The open door on bus ${journey?.busNumber || '2'}`
                      : stage === 'tap'
                        ? 'The card reader by the door'
                        : stage === 'ride'
                          ? 'A seat near the driver'
                          : destinationName
                }
              />
              <View style={{ gap: 6 }}>
                <Text
                  style={{
                    fontFamily: font.display,
                    fontSize: scale(isWide ? 38 : 30),
                    lineHeight: scale(isWide ? 42 : 34),
                    fontWeight: '400',
                    letterSpacing: -0.4,
                    color: colors.ink
                  }}
                >
                  {copy?.title}
                </Text>
                <Text
                  style={{
                    fontSize: scale(17),
                    lineHeight: bodyLine(17),
                    color: colors.muted,
                    maxWidth: 560
                  }}
                >
                  {copy?.detail}
                </Text>
              </View>

              {scriptOpen ? (
                <View
                  style={{
                    backgroundColor: colors.brandSoft,
                    borderRadius: radius.md,
                    padding: 16,
                    gap: 8
                  }}
                >
                  <Text style={{ fontSize: scale(13), fontWeight: '800', color: colors.brand }}>
                    Ask the driver
                  </Text>
                  <Text
                    style={{
                      fontSize: scale(19),
                      lineHeight: bodyLine(19),
                      fontWeight: '700',
                      color: colors.ink
                    }}
                  >
                    “Does this bus go to {destinationName}?”
                  </Text>
                  <Pressable
                    accessibilityRole='button'
                    accessibilityLabel='Close driver script'
                    onPress={() => setScriptOpen(false)}
                    style={{ minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' }}
                  >
                    <Text style={{ fontSize: scale(14), fontWeight: '700', color: colors.brand }}>
                      Close
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {busMissed ? (
                <AlertCard
                  tone='warning'
                  title='The bus did not stop'
                  detail={`Wait for the next bus ${journey?.busNumber || '2'}. It will come in 8 minutes. You are still in the right place.`}
                  primaryLabel='I am still waiting'
                  onPrimary={() => setBusMissed(false)}
                  scale={scale}
                  bodyLine={bodyLine}
                />
              ) : null}

              {missedStop ? (
                <AlertCard
                  tone='danger'
                  title='Stay on the bus'
                  detail='We are calling your caregiver now. Do not get off at the next stop unless it is safe.'
                  primaryLabel='Call caregiver'
                  onPrimary={handleCall}
                  secondaryLabel='I am okay'
                  onSecondary={() => setMissedStop(false)}
                  scale={scale}
                  bodyLine={bodyLine}
                />
              ) : null}

              <View style={{ gap: 10 }}>
                <ActionButton label={copy?.primary ?? 'Continue'} onPress={nextStage} fullWidth />
                <ActionButton
                  label='I’m not sure'
                  variant='ghost'
                  icon='help-circle-outline'
                  onPress={openHelp}
                  fullWidth
                />
                {stage === 'wait' ? (
                  <Pressable
                    accessibilityRole='button'
                    accessibilityLabel='The bus did not stop'
                    onPress={() => setBusMissed(true)}
                    style={{ minHeight: 44, alignSelf: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ fontSize: scale(13), fontWeight: '600', color: colors.muted }}>
                      The bus did not stop
                    </Text>
                  </Pressable>
                ) : null}
                {stage === 'board' ? (
                  <Pressable
                    accessibilityRole='button'
                    accessibilityLabel='Is this my bus?'
                    onPress={() => setScriptOpen(true)}
                    style={{ minHeight: 44, alignSelf: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ fontSize: scale(13), fontWeight: '600', color: colors.muted }}>
                      Is this my bus?
                    </Text>
                  </Pressable>
                ) : null}
                {stage === 'ride' ? (
                  <Pressable
                    accessibilityRole='button'
                    accessibilityLabel='I missed my stop'
                    onPress={() => setMissedStop(true)}
                    style={{ minHeight: 44, alignSelf: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ fontSize: scale(13), fontWeight: '600', color: colors.muted }}>
                      I missed my stop
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            <View style={{ flex: isWide ? 0.75 : undefined, gap: 14, minWidth: 0 }}>
              <TripStatusCard
                destinationName={destinationName}
                stage={stage}
                isPractice={isPractice}
                busNumber={journey?.busNumber || '2'}
                scale={scale}
                bodyLine={bodyLine}
              />
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.line,
                  borderRadius: radius.lg,
                  padding: 18,
                  gap: 10
                }}
              >
                <Text style={{ fontSize: scale(12), fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase', color: colors.muted }}>
                  If something changes
                </Text>
                <Text style={{ fontSize: scale(15), lineHeight: bodyLine(15), color: colors.ink }}>
                  {stage === 'wait'
                    ? 'If the bus is late, wait where you are. We will tell you when it comes.'
                    : stage === 'ride'
                      ? 'If you miss your stop, stay on the bus. We will call your caregiver.'
                      : stage === 'alight'
                        ? 'If you get off at the wrong stop, stay where you are and press I’m not sure.'
                        : 'If you are not sure, ask the driver or press I’m not sure.'}
                </Text>
                <Text style={{ fontSize: scale(14), lineHeight: bodyLine(14), color: colors.muted }}>
                  You can press “I’m not sure” at any time. It is not a failure.
                </Text>
              </View>
              <ActionButton label='Call caregiver' icon='call-outline' variant='ghost' onPress={handleCall} fullWidth />
            </View>
          </View>
        )}
      </View>
      <Toast message={message} />
    </AppFrame>
  )
}

function StoryView({
  title,
  steps,
  busNumber,
  isWide,
  checks,
  onToggleCheck,
  onStart,
  onPractice,
  onCall,
  scale,
  bodyLine
}: {
  title: string
  steps: StoryStep[]
  busNumber: string
  isWide: boolean
  checks: { card: boolean; battery: boolean; headphones: boolean }
  onToggleCheck: (key: 'card' | 'battery' | 'headphones') => void
  onStart: () => void
  onPractice: () => void
  onCall: () => void
  scale: (n: number) => number
  bodyLine: (n: number) => number
}) {
  return (
    <View style={{ flexDirection: isWide ? 'row' : 'column', gap: space.lg, alignItems: 'stretch' }}>
      <View
        style={{
          flex: isWide ? 1.45 : undefined,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: radius.xl,
          padding: isWide ? 28 : 20,
          gap: 22,
          boxShadow: shadow.card,
          minWidth: 0
        }}
      >
        <View style={{ gap: 4 }}>
          <Text
            style={{
              fontFamily: font.display,
              fontSize: scale(isWide ? 44 : 34),
              lineHeight: scale(isWide ? 48 : 38),
              fontWeight: '400',
              letterSpacing: -0.5,
              color: colors.ink
            }}
          >
            {title}
          </Text>
          <Text style={{ fontSize: scale(15), lineHeight: bodyLine(15), color: colors.muted }}>
            {steps.length} steps · bus {busNumber}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            <ActionButton label='Start trip' onPress={onStart} />
            <ActionButton label='Practice this trip' variant='secondary' onPress={onPractice} />
          </View>
        </View>

        <View style={{ paddingLeft: 18, borderLeftWidth: 2, borderLeftColor: colors.line, gap: 18, marginLeft: 16 }}>
          {steps.map((step, index) => (
            <View
              key={step.id}
              style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginLeft: -34 }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: colors.surface,
                  borderWidth: 2,
                  borderColor: colors.brand,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name={step.icon} size={scale(17)} color={colors.brand} />
              </View>
              <View style={{ flex: 1, gap: 2, paddingTop: 2 }}>
                <Text style={{ fontSize: scale(16), fontWeight: '700', color: colors.ink }}>
                  {step.title}
                </Text>
                <Text style={{ fontSize: scale(14), lineHeight: bodyLine(14), color: colors.muted }}>
                  {step.detail}
                </Text>
                {step.photoUrl ? (
                  <Image
                    source={{ uri: step.photoUrl }}
                    style={{
                      width: '100%',
                      height: 150,
                      borderRadius: radius.md,
                      marginTop: 8
                    }}
                    contentFit='cover'
                    accessibilityLabel={`Photo for ${step.title}`}
                  />
                ) : null}
              </View>
              <Text style={{ fontSize: scale(12), fontVariant: ['tabular-nums'], color: colors.faint, paddingTop: 5 }}>
                {String(index + 1).padStart(2, '0')}
              </Text>
            </View>
          ))}
        </View>

      </View>

      <View style={{ flex: isWide ? 0.8 : undefined, gap: 14, minWidth: 0 }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
            borderRadius: radius.lg,
            padding: 18,
            gap: 10,
            boxShadow: shadow.card
          }}
        >
          <Text style={{ fontSize: scale(12), fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase', color: colors.muted }}>
            Before you go
          </Text>
          {[
            { key: 'card' as const, label: 'Fare card in your pocket' },
            { key: 'battery' as const, label: 'Phone has enough battery' },
            { key: 'headphones' as const, label: 'Headphones or sound on' }
          ].map(item => (
            <Pressable
              key={item.key}
              accessibilityRole='checkbox'
              accessibilityState={{ checked: checks[item.key] }}
              accessibilityLabel={item.label}
              onPress={() => onToggleCheck(item.key)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 }}
            >
              <Ionicons
                name={checks[item.key] ? 'checkbox' : 'square-outline'}
                size={scale(22)}
                color={checks[item.key] ? colors.success : colors.lineStrong}
              />
              <Text style={{ fontSize: scale(15), lineHeight: bodyLine(15), color: colors.ink }}>
                {item.label}
              </Text>
            </Pressable>
          ))}
          <Text style={{ fontSize: scale(13), lineHeight: bodyLine(13), color: colors.muted }}>
            You can start even if a box is empty. The app will help you fix it.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
            borderRadius: radius.lg,
            padding: 18,
            gap: 8
          }}
        >
          <Text style={{ fontSize: scale(12), fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase', color: colors.muted }}>
            Caregiver
          </Text>
          <Text style={{ fontSize: scale(17), fontWeight: '700', color: colors.ink }}>
            Call your caregiver
          </Text>
          <Text style={{ fontSize: scale(14), lineHeight: bodyLine(14), color: colors.muted }}>
            They can stay on the phone until you arrive.
          </Text>
          <ActionButton label='Call now' icon='call-outline' variant='secondary' onPress={onCall} fullWidth />
        </View>
      </View>
    </View>
  )
}

function TripStatusCard({
  destinationName,
  stage,
  isPractice,
  busNumber,
  scale,
  bodyLine
}: {
  destinationName: string
  stage: ScreenStage
  isPractice: boolean
  busNumber: string
  scale: (n: number) => number
  bodyLine: (n: number) => number
}) {
  return (
    <View
      style={{
        backgroundColor: colors.brandSoft,
        borderRadius: radius.lg,
        padding: 18,
        gap: 8
      }}
    >
      <Text style={{ fontSize: scale(12), fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase', color: colors.brand }}>
        {isPractice ? 'Practice trip' : 'On this trip'}
      </Text>
      <Text style={{ fontSize: scale(19), fontWeight: '800', color: colors.ink }}>
        {destinationName}
      </Text>
      <Text style={{ fontSize: scale(14), lineHeight: bodyLine(14), color: colors.inkSoft }}>
        {tripStatusText(stage, isPractice, busNumber)}
      </Text>
    </View>
  )
}

function tripStatusText(stage: ScreenStage, isPractice: boolean, busNumber: string) {
  if (isPractice) return 'Waiting at the bus stop. Nothing is shared in practice.'
  switch (stage) {
    case 'wait':
      return 'Waiting at the bus stop. Your caregiver can see this trip.'
    case 'board':
      return `The door is open. Get on bus ${busNumber}.`
    case 'tap':
      return 'Tap your card near the door.'
    case 'ride':
      return `On bus ${busNumber}. 8 stops to go.`
    default:
      return 'Getting ready to get off.'
  }
}

function AlertCard({
  tone,
  title,
  detail,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  scale,
  bodyLine
}: {
  tone: 'warning' | 'danger'
  title: string
  detail: string
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  scale: (n: number) => number
  bodyLine: (n: number) => number
}) {
  const palette =
    tone === 'danger'
      ? { bg: colors.dangerSoft, ink: colors.danger }
      : { bg: colors.warningSoft, ink: colors.warning }

  return (
    <View style={{ backgroundColor: palette.bg, borderRadius: radius.md, padding: 16, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name='alert-circle-outline' size={scale(20)} color={palette.ink} />
        <Text style={{ fontSize: scale(16), fontWeight: '800', color: palette.ink }}>{title}</Text>
      </View>
      <Text style={{ fontSize: scale(14), lineHeight: bodyLine(14), color: colors.inkSoft }}>{detail}</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
        <ActionButton label={primaryLabel} variant='secondary' onPress={onPrimary} />
        {secondaryLabel && onSecondary ? (
          <ActionButton label={secondaryLabel} variant='ghost' onPress={onSecondary} />
        ) : null}
      </View>
    </View>
  )
}

function ArrivedView({
  destinationName,
  scale,
  bodyLine,
  onDone,
  onHelp
}: {
  destinationName: string
  scale: (n: number) => number
  bodyLine: (n: number) => number
  onDone: () => void
  onHelp: () => void
}) {
  return (
    <View
      style={{
        maxWidth: 720,
        marginHorizontal: 'auto',
        width: '100%',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.xl,
        padding: 32,
        gap: 18,
        alignItems: 'center',
        boxShadow: shadow.card
      }}
    >
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          backgroundColor: colors.successSoft,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Ionicons name='checkmark-circle' size={scale(44)} color={colors.success} />
      </View>
      <Text
        style={{
          fontFamily: font.display,
          fontSize: scale(42),
          lineHeight: scale(46),
          color: colors.ink,
          textAlign: 'center'
        }}
      >
        You are here.
      </Text>
      <Text style={{ fontSize: scale(18), lineHeight: bodyLine(18), color: colors.muted, textAlign: 'center' }}>
        {destinationName}. Your caregiver knows you arrived.
      </Text>
      <View style={{ width: '100%', gap: 10, maxWidth: 420 }}>
        <ActionButton label='Done' onPress={onDone} fullWidth />
        <ActionButton label='I need help' variant='ghost' onPress={onHelp} fullWidth />
      </View>
    </View>
  )
}
