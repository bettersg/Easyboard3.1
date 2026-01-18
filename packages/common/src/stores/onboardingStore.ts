import { create } from 'zustand'

export interface LatLong {
  latitude: number
  longitude: number
}

export interface MarkerData {
  description: string
  latlng: LatLong
  photoUri?: string
}

export interface OnboardingFormData {
  name: string | null
  careGiverPhoneNumber: string
  houseAddrs: MarkerData | null
  housePhotoUri: string | string[] | null
  gotoFavAddrs: MarkerData | null
  gotoFavAddrsName: string
  gotoFavPhotoUri: string | string[] | null
  schoolAddrs: MarkerData | null
  schoolPhotoUri: string | string[] | null
}

interface OnboardingStore {
  formData: OnboardingFormData
  updateFormData: (data: Partial<OnboardingFormData>) => void
  resetFormData: () => void
}

const initialFormData: OnboardingFormData = {
  name: null,
  careGiverPhoneNumber: '',
  houseAddrs: null,
  housePhotoUri: null,
  gotoFavAddrs: null,
  gotoFavAddrsName: '',
  gotoFavPhotoUri: null,
  schoolAddrs: null,
  schoolPhotoUri: null
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  formData: initialFormData,
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data }
    })),
  resetFormData: () => set({ formData: initialFormData })
}))
