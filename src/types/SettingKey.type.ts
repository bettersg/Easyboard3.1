export type SettingValues = {
  [key in SettingKey]: any | any[]
}

export type SettingKey =
  | 'name'
  | 'careGiverPhoneNumber'
  | 'houseAddrs'
  | 'housePhotoUri'
  | 'gotoFavAddrs'
  | 'gotoFavAddrsName'
  | 'gotoFavPhotoUri'
