import { StatusBar } from "expo-status-bar";
import { Text, View, ScrollView, Alert } from "react-native";
import PhotoSelect from "../common/PhotoSelect";
import {
  useForm,
  Controller,
  FieldError,
  FieldErrorsImpl,
  Merge,
} from "react-hook-form";
import LocationTextInput from "../common/locationSelector/LocationInputText";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import RootStackParamList from "../types/RootStackParamList.type";
import Constants from "expo-constants";
import { SettingKey, SettingValues } from "../types/SettingKey.type";
import Page from "../common/components/Page";
import EasyboardTextInput from "../common/components/EasyboardTextInput";
import EasyboardButton from "../common/components/EasyboardButton";
import LoadingIndicator from "../common/components/LoadingIndicator";

type Props = NativeStackScreenProps<RootStackParamList, "Setting">;

const PHONE_NUMBER_LENGTH = 8;

export default function Setting({ navigation }: Props) {
  const {
    control,
    setValue,
    watch,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    reValidateMode: "onChange",
    defaultValues: {
      name: null,
      careGiverPhoneNumber: "",
      houseAddrs: null,
      housePhotoUri: null,
      gotoFavAddrs: null,
      gotoFavAddrsName: "",
      gotoFavPhotoUri: null,
    } as SettingValues,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState(true);

  const setHouseImgUri = (imgUri: string | string[]) => {
    setValue("housePhotoUri", imgUri, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const setGotoFavPhotoUri = (imgUri: string | string[]) => {
    setValue("gotoFavPhotoUri", imgUri, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSavePressed = async () => {
    // Manually check the validation
    if (await trigger()) {
      // Use the build in validation
      handleSubmit(saveSettings(), () => {
        Alert.alert(
          "Field Errors",
          "There are some fields that have some errors."
        );
      });
    } else {
      Alert.alert(
        "Field Errors",
        "There are some fields that have some errors."
      );
    }
  };

  const saveSettings = async function () {
    try {
      const data = JSON.stringify(watch());
      await SecureStore.setItemAsync(
        Constants?.expoConfig?.extra?.settingsStoredKey,
        data
      );
      Alert.alert("Data Saved");
      if (!isNewUser) navigation.goBack();
      else
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Render error if field is invalid for submission
   * @param err FieldError native from React Hook Forms
   * @param display User-facing field name
   * @returns React Component
   */
  const renderError = (
    err: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined,
    display: string
  ) => {
    if (err) {
      let errorString = "";
      if (err.type === "required") {
        errorString = `${display} is required.`;
      } else if (err.type === "minLength") {
        errorString = `${display} has to be at least ${PHONE_NUMBER_LENGTH} digits.`;
      }
      return (
        <View className="mt-1">
          <Text className="text-error font-light">{errorString}</Text>
        </View>
      );
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const storedData = await SecureStore.getItemAsync(
          Constants?.expoConfig?.extra?.settingsStoredKey
        );
        if (storedData) {
          setIsNewUser(false);
          const settingsData = JSON.parse(storedData);
          Object.keys(settingsData).forEach((key) => {
            setValue(key as SettingKey, settingsData[key]);
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    );
  }

  return (
    <Page>
      <ScrollView>
        <View>
          {/* Name Input */}
          <View className="py-2">
            <Text className="text-lg text-black mb-2">What is your name?</Text>
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <EasyboardTextInput
                  autoComplete="off"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Name"
                  returnKeyType="done"
                />
              )}
              name="name"
            />
            {renderError(errors.name, "Name")}
          </View>
          {/* Caregiver Phone Number */}
          <View className="py-2">
            <Text className="text-lg text-black mb-2">
              What is your caregiver's phone number?
            </Text>
            <Controller
              control={control}
              rules={{
                required: true,
                minLength: PHONE_NUMBER_LENGTH,
                maxLength: PHONE_NUMBER_LENGTH,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <EasyboardTextInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Phone number"
                  keyboardType="numeric"
                  returnKeyType="done"
                  maxLength={8}
                />
              )}
              name="careGiverPhoneNumber"
            />
            {renderError(
              errors.careGiverPhoneNumber,
              "Caregiver's Phone Number"
            )}
          </View>
          {/* Home Address */}
          <View className="py-2">
            <Text className="text-lg text-black mb-2">Where is your home?</Text>
            <Controller
              control={control}
              rules={{ required: true }}
              render={() => (
                <LocationTextInput
                  value={watch("houseAddrs")}
                  onLocationSelect={(markerLocation: any) =>
                    setValue("houseAddrs", markerLocation, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                />
              )}
              name="houseAddrs"
            />
            {renderError(errors.houseAddrs, "Home Address")}
          </View>
          {/* Home Address - Photo */}
          <View className="py-2">
            <Text className="text-lg text-black mb-2">
              Upload reference image of home
            </Text>
            <Controller
              control={control}
              render={() => (
                <PhotoSelect
                  imgChange={setHouseImgUri}
                  value={watch("housePhotoUri")}
                />
              )}
              name="housePhotoUri"
            />
          </View>

          {/* Favorite Address - Name*/}
          <View className="py-2">
            <Text className="text-lg text-black mb-2">
              What is the name of the location you visit frequently?
            </Text>
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <EasyboardTextInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Location"
                  returnKeyType="done"
                />
              )}
              name="gotoFavAddrsName"
            />
            {renderError(errors.gotoFavAddrsName, "Location name")}
          </View>
          {/* Favorite Address - Location */}
          <View className="py-2">
            <Text className="text-lg text-black mb-2">
              Frequent visit location address
            </Text>
            <Controller
              control={control}
              rules={{ required: true }}
              render={() => (
                <LocationTextInput
                  value={watch("gotoFavAddrs")}
                  onLocationSelect={(markerLocation: any) =>
                    setValue("gotoFavAddrs", markerLocation, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                />
              )}
              name="gotoFavAddrs"
            />
            {renderError(errors.gotoFavAddrs, "Location")}
          </View>
          {/* Favorite Address - Image */}
          <View className="py-2">
            <Text className="text-lg text-black mb-2">
              Upload reference image of{" "}
              {watch("gotoFavAddrsName").length > 0 ? (
                <Text className="font-semibold text-primary">
                  {watch("gotoFavAddrsName")}
                </Text>
              ) : (
                "frequently visited location"
              )}
            </Text>
            <Controller
              control={control}
              render={() => (
                <PhotoSelect
                  imgChange={setGotoFavPhotoUri}
                  value={watch("gotoFavPhotoUri")}
                />
              )}
              name="gotoFavPhotoUri"
            />
          </View>
        </View>
        <View className="mt-5">
          <EasyboardButton
            type="bg-primary"
            onPress={onSavePressed}
            title="Save"
            titleSize="text-lg"
            iconName="save"
          />
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </Page>
  );
}
