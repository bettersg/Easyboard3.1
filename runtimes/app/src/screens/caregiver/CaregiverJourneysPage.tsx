'use client'

import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'
import {
  Pressable,
  TextInput,
  useWindowDimensions,
  View,
  type TextStyle
} from 'react-native'
import { Text } from '../../components'
import { ActionButton, AppFrame, Toast } from '../../components/ui'
import { usePreferences } from '../../contexts/PreferencesContext'
import { useToast } from '../../hooks/useToast'
import {
  deleteJourney,
  getJourneys,
  saveJourney
} from '../../services/journeyService'
import {
  getPhotoDownloadUrl,
  getUserStorage,
  uploadLocationPhoto
} from '../../services/storageService'
import { getPWIDsByCaregiverPhone } from '../../services/userService'
import { getStoryStepIcon, getStorySteps } from '../trip/tripData'
import { colors, font, radius, shadow, space } from '../../theme/tokens'
import type { Journey, JourneyStep, PWIDUser } from '../../types'

type Screen = 'people' | 'journeys' | 'edit'

const CORE_STEP_IDS = new Set(['wait', 'board', 'tap', 'ride', 'alight'])
const MIN_STEPS = 5
const MAX_STEPS = 8

function personName(person: PWIDUser) {
  const name = person.name?.trim() || 'your person'
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function suggestedSteps(destinationName: string): JourneyStep[] {
  return getStorySteps(destinationName).map(step => ({
    id: step.id,
    title: step.title,
    detail: step.detail
  }))
}

function newJourney(person: PWIDUser): Journey {
  const destinationName = person.savedPlaces?.[0]?.locationName || 'Home'
  return {
    id: `journey-${Date.now()}`,
    destinationName,
    originName: 'Home',
    busNumber: '2',
    steps: suggestedSteps(destinationName),
    updatedAt: Date.now()
  }
}

export function CaregiverJourneysPage() {
  const router = useRouter()
  const { phone: initialPhone } = useLocalSearchParams<{ phone?: string }>()
  const { width } = useWindowDimensions()
  const { scale, bodyLine } = usePreferences()
  const { message, showToast } = useToast()

  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [people, setPeople] = useState<PWIDUser[]>([])
  const [selected, setSelected] = useState<PWIDUser | null>(null)
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [screen, setScreen] = useState<Screen>('people')
  const [draft, setDraft] = useState<Journey | null>(null)
  const [editingExisting, setEditingExisting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [photoStepId, setPhotoStepId] = useState<string | null>(null)
  const [photoBusyStepId, setPhotoBusyStepId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const isWide = width >= 760

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await getUserStorage()
        if (stored?.userType !== 'CAREGIVER') {
          setAllowed(false)
          return
        }
        setAllowed(true)
        const list = await getPWIDsByCaregiverPhone(stored.phoneNumber)
        const unique = Array.from(
          new Map(list.map(person => [person.phoneNumber, person])).values()
        )
        setPeople(unique)

        if (initialPhone) {
          const match = unique.find(person => person.phoneNumber === initialPhone)
          if (match) {
            setSelected(match)
            setScreen('journeys')
            try {
              setJourneys(await getJourneys(match.phoneNumber))
            } catch (error) {
              console.error('Error loading journeys:', error)
              setJourneys(match.journeys ?? [])
            }
          }
        }
      } catch (error) {
        console.error('Error loading people for journey setup:', error)
        showToast('Could not load the people you support.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [initialPhone, showToast])

  const choosePerson = useCallback(
    async (person: PWIDUser) => {
      setSelected(person)
      setScreen('journeys')
      try {
        const list = await getJourneys(person.phoneNumber)
        setJourneys(list)
      } catch (error) {
        console.error('Error loading journeys:', error)
        setJourneys(person.journeys ?? [])
        showToast('Could not refresh journeys.')
      }
    },
    [showToast]
  )

  const startNew = () => {
    if (!selected) return
    setDraft(newJourney(selected))
    setEditingExisting(false)
    setScreen('edit')
  }

  const startEdit = (journey: Journey) => {
    setDraft({
      ...journey,
      steps: journey.steps.map(step => ({ ...step }))
    })
    setEditingExisting(true)
    setScreen('edit')
  }

  const chooseDestination = (destinationName: string) => {
    setDraft(current => {
      if (!current) return current
      const photos = new Map(current.steps.map(step => [step.id, step.photoUrl]))
      return {
        ...current,
        destinationName,
        steps: suggestedSteps(destinationName).map(step => ({
          ...step,
          photoUrl: photos.get(step.id)
        }))
      }
    })
  }

  const updateStep = (stepId: string, updates: Partial<JourneyStep>) => {
    setDraft(current =>
      current
        ? {
            ...current,
            steps: current.steps.map(step =>
              step.id === stepId ? { ...step, ...updates } : step
            )
          }
        : current
    )
  }

  const addPhoto = async (stepId: string, source: 'camera' | 'library') => {
    setPhotoStepId(null)
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        showToast('Photo permission is needed.')
        return
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: true
      }
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options)
      if (result.canceled || !result.assets?.[0]) return

      setPhotoBusyStepId(stepId)
      const path = await uploadLocationPhoto(result.assets[0].uri, 'journey')
      const url = await getPhotoDownloadUrl(path)
      updateStep(stepId, { photoUrl: url })
      showToast('Photo added.')
    } catch (error) {
      console.error('Error adding journey photo:', error)
      showToast('Could not add this photo. Try again.')
    } finally {
      setPhotoBusyStepId(null)
    }
  }

  const handleSave = async () => {
    if (!selected || !draft || saving) return
    const destinationName = draft.destinationName.trim()
    if (!destinationName) {
      showToast('Add where the person is going.')
      return
    }
    if (draft.steps.some(step => !step.title.trim())) {
      showToast('Give every step a name.')
      return
    }
    setSaving(true)
    try {
      const journey: Journey = {
        ...draft,
        destinationName,
        originName: draft.originName.trim() || 'Home',
        busNumber: draft.busNumber.trim() || '2',
        steps: draft.steps.map(step => ({
          ...step,
          title: step.title.trim(),
          detail: step.detail.trim()
        })),
        updatedAt: Date.now()
      }
      const next = await saveJourney(selected.phoneNumber, journey)
      setJourneys(next)
      setDraft(journey)
      setScreen('journeys')
      showToast('Journey saved.')
    } catch (error) {
      console.error('Error saving journey:', error)
      showToast('Could not save this journey. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (journeyId: string) => {
    if (!selected) return
    try {
      const next = await deleteJourney(selected.phoneNumber, journeyId)
      setJourneys(next)
      setDeleteConfirmId(null)
      showToast('Journey deleted.')
    } catch (error) {
      console.error('Error deleting journey:', error)
      showToast('Could not delete this journey.')
    }
  }

  const addStep = () => {
    setDraft(current => {
      if (!current || current.steps.length >= MAX_STEPS) return current
      const step: JourneyStep = {
        id: `custom-${Date.now()}`,
        title: 'New step',
        detail: ''
      }
      const steps = [...current.steps]
      const arriveIndex = steps.findIndex(item => item.id === 'arrive')
      if (arriveIndex >= 0) steps.splice(arriveIndex, 0, step)
      else steps.push(step)
      return { ...current, steps }
    })
  }

  const removeStep = (stepId: string) => {
    setDraft(current => {
      if (!current || current.steps.length <= MIN_STEPS) return current
      if (CORE_STEP_IDS.has(stepId)) return current
      return {
        ...current,
        steps: current.steps.filter(step => step.id !== stepId)
      }
    })
  }

  const backToPeople = () => {
    setSelected(null)
    setJourneys([])
    setDraft(null)
    setScreen('people')
  }

  if (loading) {
    return (
      <AppFrame>
        <View style={{ minHeight: 320, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: scale(15), color: colors.muted }}>Loading…</Text>
        </View>
      </AppFrame>
    )
  }

  if (allowed === false) {
    return (
      <AppFrame>
        <View style={{ maxWidth: 620, marginHorizontal: 'auto', gap: 14, paddingTop: 24 }}>
          <Text style={{ fontFamily: font.display, fontSize: scale(32), color: colors.ink }}>
            This screen is for caregivers.
          </Text>
          <Text style={{ fontSize: scale(16), lineHeight: bodyLine(16), color: colors.muted }}>
            Sign in with a caregiver account to set up journeys.
          </Text>
          <ActionButton label='Go to my home' onPress={() => router.navigate('/home')} />
        </View>
      </AppFrame>
    )
  }

  return (
    <AppFrame statusLabel='Caregiver view' statusAction='none'>
      <View
        style={{
          width: '100%',
          maxWidth: 820,
          marginHorizontal: 'auto',
          gap: space.lg
        }}
      >
        <Pressable
          accessibilityRole='button'
          accessibilityLabel={screen === 'people' ? 'Back to home' : 'Back to people'}
          onPress={() => {
            if (screen === 'people') {
              if (router.canGoBack()) router.back()
              else router.navigate('/home')
            }
            else if (screen === 'journeys') backToPeople()
            else setScreen('journeys')
          }}
          style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Ionicons name='arrow-back' size={scale(20)} color={colors.brand} />
          <Text style={{ fontSize: scale(14), fontWeight: '700', color: colors.brand }}>
            {screen === 'people' ? 'Home' : screen === 'journeys' ? 'People' : 'Journeys'}
          </Text>
        </Pressable>

        {screen === 'people' ? (
          <PeopleView
            people={people}
            scale={scale}
            bodyLine={bodyLine}
            onChoose={person => void choosePerson(person)}
            isWide={isWide}
            onHome={() => router.navigate('/home')}
          />
        ) : screen === 'journeys' && selected ? (
          <JourneyListView
            person={selected}
            journeys={journeys}
            scale={scale}
            bodyLine={bodyLine}
            onNew={startNew}
            onEdit={startEdit}
            onDelete={handleDelete}
            deleteConfirmId={deleteConfirmId}
            onAskDelete={setDeleteConfirmId}
          />
        ) : draft && selected ? (
          <JourneyEditor
            person={selected}
            draft={draft}
            setDraft={setDraft}
            scale={scale}
            bodyLine={bodyLine}
            editingExisting={editingExisting}
            saving={saving}
            photoStepId={photoStepId}
            photoBusyStepId={photoBusyStepId}
            onChooseDestination={chooseDestination}
            onUpdateStep={updateStep}
            onOpenPhoto={setPhotoStepId}
            onAddPhoto={addPhoto}
            onCancelPhoto={() => setPhotoStepId(null)}
            onSave={() => void handleSave()}
            onAddStep={addStep}
            onRemoveStep={removeStep}
          />
        ) : null}
      </View>
      <Toast message={message} />
    </AppFrame>
  )
}

function PeopleView({
  people,
  scale,
  bodyLine,
  onChoose,
  isWide,
  onHome
}: {
  people: PWIDUser[]
  scale: (n: number) => number
  bodyLine: (n: number) => number
  onChoose: (person: PWIDUser) => void
  isWide: boolean
  onHome: () => void
}) {
  return (
    <>
      <View style={{ gap: 8 }}>
        <Text
          style={{
            fontSize: scale(13),
            fontWeight: '800',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: colors.brand
          }}
        >
          Journey setup
        </Text>
        <Text
          style={{
            fontFamily: font.display,
            fontSize: scale(isWide ? 42 : 34),
            lineHeight: scale(isWide ? 46 : 38),
            color: colors.ink
          }}
        >
          Who is this for?
        </Text>
      </View>

      {people.length > 0 ? (
        <View style={{ gap: 10 }}>
          {people.map(person => {
            const name = personName(person)
            const initials = name.charAt(0).toUpperCase()
            return (
              <Pressable
                key={person.phoneNumber}
                accessibilityRole='button'
                accessibilityLabel={`Set up a journey for ${name}`}
                onPress={() => onChoose(person)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.line,
                  borderRadius: radius.lg,
                  padding: 18,
                  boxShadow: shadow.card,
                  opacity: pressed ? 0.8 : 1
                })}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.brandSoft,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ fontSize: scale(18), fontWeight: '800', color: colors.brand }}>
                    {initials}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: scale(19), fontWeight: '800', color: colors.ink }}>
                    {name}
                  </Text>
                  <Text style={{ fontSize: scale(13), lineHeight: bodyLine(13), color: colors.muted }}>
                    {person.savedPlaces?.length
                      ? `${person.savedPlaces.length} saved place${person.savedPlaces.length === 1 ? '' : 's'}`
                      : 'No saved places yet'}
                    {person.phoneNumber ? ` · •••• ${person.phoneNumber.slice(-4)}` : ''}
                  </Text>
                </View>
                <Ionicons name='chevron-forward' size={scale(22)} color={colors.faint} />
              </Pressable>
            )
          })}
        </View>
      ) : (
        <View
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
            borderRadius: radius.lg,
            padding: 24,
            gap: 8
          }}
        >
          <Text style={{ fontSize: scale(18), fontWeight: '800', color: colors.ink }}>
            No one linked yet
          </Text>
          <Text style={{ fontSize: scale(14), lineHeight: bodyLine(14), color: colors.muted }}>
            Someone must add your phone number as their caregiver before you can plan a journey.
          </Text>
          <ActionButton label='Back to home' variant='secondary' onPress={onHome} />
        </View>
      )}
    </>
  )
}

function JourneyListView({
  person,
  journeys,
  scale,
  bodyLine,
  onNew,
  onEdit,
  onDelete,
  deleteConfirmId,
  onAskDelete
}: {
  person: PWIDUser
  journeys: Journey[]
  scale: (n: number) => number
  bodyLine: (n: number) => number
  onNew: () => void
  onEdit: (journey: Journey) => void
  onDelete: (id: string) => void
  deleteConfirmId: string | null
  onAskDelete: (id: string | null) => void
}) {
  const name = personName(person)
  return (
    <>
      <View style={{ gap: 8 }}>
        <Text
          style={{
            fontSize: scale(13),
            fontWeight: '800',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: colors.brand
          }}
        >
          Journey setup
        </Text>
        <Text
          style={{
            fontFamily: font.display,
            fontSize: scale(34),
            lineHeight: scale(38),
            color: colors.ink
          }}
        >
          {name}&apos;s journeys.
        </Text>
      </View>

      <ActionButton label='New journey' icon='add' onPress={onNew} fullWidth />

      {journeys.length > 0 ? (
        <View style={{ gap: 10 }}>
          {journeys.map(journey => {
            const photos = journey.steps.filter(step => step.photoUrl).length
            return (
              <View
                key={journey.id}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.line,
                  borderRadius: radius.lg,
                  padding: 18,
                  gap: 12
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: colors.brandSoft,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Ionicons name='bus-outline' size={scale(22)} color={colors.brand} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontSize: scale(18), fontWeight: '800', color: colors.ink }}>
                      To {journey.destinationName}
                    </Text>
                    <Text style={{ fontSize: scale(13), lineHeight: bodyLine(13), color: colors.muted }}>
                      Bus {journey.busNumber} · {journey.steps.length} steps · {photos} photo{photos === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>
                {deleteConfirmId === journey.id ? (
                  <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: scale(14), lineHeight: bodyLine(14), color: colors.inkSoft }}>
                      Delete this journey?
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      <ActionButton label='Delete' variant='danger' size='sm' onPress={() => onDelete(journey.id)} />
                      <ActionButton label='Cancel' variant='ghost' size='sm' onPress={() => onAskDelete(null)} />
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    <ActionButton label='Edit' icon='create-outline' size='sm' onPress={() => onEdit(journey)} />
                    <ActionButton label='Delete' icon='trash-outline' variant='ghost' size='sm' onPress={() => onAskDelete(journey.id)} />
                  </View>
                )}
              </View>
            )
          })}
        </View>
      ) : (
        <View
          style={{
            backgroundColor: colors.surfaceMuted,
            borderRadius: radius.lg,
            padding: 18
          }}
        >
          <Text style={{ fontSize: scale(15), lineHeight: bodyLine(15), color: colors.muted }}>
            No journeys yet.
          </Text>
        </View>
      )}
    </>
  )
}

function JourneyEditor({
  person,
  draft,
  setDraft,
  scale,
  bodyLine,
  editingExisting,
  saving,
  photoStepId,
  photoBusyStepId,
  onChooseDestination,
  onUpdateStep,
  onOpenPhoto,
  onAddPhoto,
  onCancelPhoto,
  onSave,
  onAddStep,
  onRemoveStep
}: {
  person: PWIDUser
  draft: Journey
  setDraft: Dispatch<SetStateAction<Journey | null>>
  scale: (n: number) => number
  bodyLine: (n: number) => number
  editingExisting: boolean
  saving: boolean
  photoStepId: string | null
  photoBusyStepId: string | null
  onChooseDestination: (name: string) => void
  onUpdateStep: (stepId: string, updates: Partial<JourneyStep>) => void
  onOpenPhoto: (stepId: string | null) => void
  onAddPhoto: (stepId: string, source: 'camera' | 'library') => void
  onCancelPhoto: () => void
  onSave: () => void
  onAddStep: () => void
  onRemoveStep: (stepId: string) => void
}) {
  const name = personName(person)
  const fieldStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: scale(15),
    lineHeight: bodyLine(15),
    color: colors.ink,
    outlineStyle: 'none'
  } as unknown as TextStyle

  return (
    <>
      <View style={{ gap: 8 }}>
        <Text
          style={{
            fontSize: scale(13),
            fontWeight: '800',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: colors.brand
          }}
        >
          Journey setup
        </Text>
        <Text
          style={{
            fontFamily: font.display,
            fontSize: scale(34),
            lineHeight: scale(38),
            color: colors.ink
          }}
        >
          {editingExisting ? `Edit ${name}'s journey.` : `New journey for ${name}.`}
        </Text>
        <Text style={{ fontSize: scale(16), lineHeight: bodyLine(16), color: colors.muted }}>
          Keep each step short.
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: scale(13), fontWeight: '800', color: colors.ink }}>
          Where are they going?
        </Text>
        <TextInput
          accessibilityLabel='Destination'
          value={draft.destinationName}
          onChangeText={value =>
            setDraft(current => {
              if (!current) return current
              const previous = current.destinationName
              const steps = current.steps.map(step => {
                if (step.id === 'alight' && step.title === `Get off at ${previous}`) {
                  return { ...step, title: `Get off at ${value}` }
                }
                if (step.id === 'arrive' && step.title === `Walk to ${previous}`) {
                  return { ...step, title: `Walk to ${value}` }
                }
                return step
              })
              return { ...current, destinationName: value, steps }
            })
          }
          maxLength={40}
          placeholder='For example, Work'
          placeholderTextColor={colors.faint}
          style={fieldStyle}
        />
        {person.savedPlaces?.length ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: scale(12), lineHeight: bodyLine(12), color: colors.muted }}>
              Use a saved place
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {person.savedPlaces.map(place => (
                <Pressable
                  key={place.locationName}
                  accessibilityRole='button'
                  accessibilityState={{ selected: draft.destinationName === place.locationName }}
                  onPress={() => onChooseDestination(place.locationName)}
                  style={{
                    minHeight: 44,
                    paddingHorizontal: 12,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor:
                      draft.destinationName === place.locationName ? colors.brand : colors.line,
                    backgroundColor:
                      draft.destinationName === place.locationName
                        ? colors.brandSoft
                        : colors.surface,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Ionicons name='location-outline' size={scale(15)} color={colors.brand} />
                  <Text style={{ fontSize: scale(13), fontWeight: '700', color: colors.ink }}>
                    {place.locationName}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: scale(13), fontWeight: '800', color: colors.ink }}>
          Bus number
        </Text>
        <TextInput
          accessibilityLabel='Bus number'
          value={draft.busNumber}
          onChangeText={value =>
            setDraft(current => {
              if (!current) return current
              const previous = current.busNumber
              const steps = current.steps.map(step => {
                if (step.title === `Wait for bus ${previous}`) {
                  return { ...step, title: `Wait for bus ${value}` }
                }
                if (step.title === `Get on bus ${previous}`) {
                  return { ...step, title: `Get on bus ${value}` }
                }
                return step
              })
              return { ...current, busNumber: value, steps }
            })
          }
          keyboardType='number-pad'
          maxLength={3}
          placeholder='2'
          placeholderTextColor={colors.faint}
          style={fieldStyle}
        />
      </View>

      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <View style={{ flex: 1, gap: 4, minWidth: 180 }}>
            <Text style={{ fontSize: scale(20), fontWeight: '800', color: colors.ink }}>
              Steps
            </Text>
            <Text style={{ fontSize: scale(13), lineHeight: bodyLine(13), color: colors.muted }}>
              {draft.steps.length} of {MAX_STEPS}
            </Text>
          </View>
          <ActionButton
            label='Add step'
            icon='add'
            variant='ghost'
            size='sm'
            disabled={draft.steps.length >= MAX_STEPS}
            onPress={onAddStep}
          />
        </View>
      </View>

      {draft.steps.map((step, index) => {
        const icon = getStoryStepIcon(step.id)
        return (
          <View
            key={step.id}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.line,
              borderRadius: radius.lg,
              padding: 16,
              gap: 10
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: colors.brandSoft,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name={icon} size={scale(17)} color={colors.brand} />
              </View>
              <Text style={{ fontSize: scale(14), fontWeight: '800', color: colors.muted }}>
                Step {index + 1}
              </Text>
              <View style={{ flex: 1 }} />
              {CORE_STEP_IDS.has(step.id) ? (
                <Text style={{ fontSize: scale(11), fontWeight: '800', color: colors.faint }}>
                  Core
                </Text>
              ) : draft.steps.length > MIN_STEPS ? (
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel={`Remove step ${index + 1}`}
                  onPress={() => onRemoveStep(step.id)}
                  style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <Ionicons name='trash-outline' size={scale(15)} color={colors.muted} />
                  <Text style={{ fontSize: scale(12), fontWeight: '700', color: colors.muted }}>
                    Remove
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={{ fontSize: scale(12), fontWeight: '700', color: colors.muted }}>
              Step name
            </Text>
            <TextInput
              accessibilityLabel={`Step ${index + 1} title`}
              value={step.title}
              maxLength={80}
              onChangeText={value => onUpdateStep(step.id, { title: value })}
              placeholder='What is this step?'
              placeholderTextColor={colors.faint}
              style={fieldStyle}
            />
            <Text style={{ fontSize: scale(12), fontWeight: '700', color: colors.muted }}>
              What to do
            </Text>
            <TextInput
              accessibilityLabel={`Step ${index + 1} instructions`}
              value={step.detail}
              maxLength={160}
              onChangeText={value => onUpdateStep(step.id, { detail: value })}
              placeholder='What should the person do?'
              placeholderTextColor={colors.faint}
              multiline
              style={[fieldStyle, { minHeight: 64, textAlignVertical: 'top' }]}
            />

            {step.photoUrl ? (
              <Image
                source={{ uri: step.photoUrl }}
                style={{ width: '100%', height: 150, borderRadius: radius.md }}
                contentFit='cover'
                accessibilityLabel={`Photo for step ${index + 1}`}
              />
            ) : null}

            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <ActionButton
                label={photoBusyStepId === step.id ? 'Uploading…' : step.photoUrl ? 'Change photo' : 'Add photo'}
                icon='camera-outline'
                variant='ghost'
                size='sm'
                disabled={photoBusyStepId === step.id}
                onPress={() => onOpenPhoto(step.id)}
              />
              {step.photoUrl ? (
                <ActionButton
                  label='Remove photo'
                  icon='trash-outline'
                  variant='ghost'
                  size='sm'
                  onPress={() => onUpdateStep(step.id, { photoUrl: undefined })}
                />
              ) : null}
            </View>

            {photoStepId === step.id ? (
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <ActionButton
                  label='Take photo'
                  icon='camera-outline'
                  size='sm'
                  onPress={() => onAddPhoto(step.id, 'camera')}
                />
                <ActionButton
                  label='Choose photo'
                  icon='image-outline'
                  variant='secondary'
                  size='sm'
                  onPress={() => onAddPhoto(step.id, 'library')}
                />
                <ActionButton
                  label='Cancel'
                  variant='ghost'
                  size='sm'
                  onPress={onCancelPhoto}
                />
              </View>
            ) : null}
          </View>
        )
      })}

      <ActionButton
        label={saving ? 'Saving…' : 'Save journey'}
        icon='checkmark'
        onPress={onSave}
        disabled={saving}
        fullWidth
      />
    </>
  )
}
