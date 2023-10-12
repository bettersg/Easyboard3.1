import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
  Alert,
  Button,
} from "react-native";
import styles from "../styles/style";
import PhotoSelect from "../common/PhotoSelect";
import { useForm, Controller } from "react-hook-form";
import LocationTextInput from "../common/locationSelector/LocationInputText";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import RootStackParamList from "../types/RootStackParamList.type";
import Constants from "expo-constants";
import { SettingKey, SettingValues } from "../types/SettingKey.type";
import Page from "../common/components/Page";

type Props = NativeStackScreenProps<RootStackParamList, "Setting">;

export default function Setting({ navigation }: Props) {
  const { control, setValue, watch, handleSubmit, trigger } = useForm({
    reValidateMode: "onChange",
    defaultValues: {
      name: null,
      careGiverPhoneNumber: "",
      houseAddrs: null,
      housePhotoUri: null,
      gotoFavAddrs: null,
      gotoFavAddrsName: "",
      gotoFavPhotoUri: [],
    } as SettingValues,
  });

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
      }
    })();
  }, []);

  return (
    <Page>
      <ScrollView>
        <View>
          <Text style={styles.label}>What is your name?</Text>
          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Name"
                returnKeyType="done"
              />
            )}
            name="name"
          />

          <Text style={styles.label}>
            What is your caregiver's phone number?
          </Text>
          <Controller
            control={control}
            rules={{ required: true, minLength: 8, maxLength: 8 }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
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

          <Text style={styles.label}>Where is your home?</Text>
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

          <Text style={styles.label}>What is your favourite go to name?</Text>
          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Favourite go to name"
                returnKeyType="done"
              />
            )}
            name="gotoFavAddrsName"
          />

          <Text style={styles.label}>Where do you usually go to?</Text>
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

          <Controller
            control={control}
            render={() => (
              <PhotoSelect
                imgChange={setGotoFavPhotoUri}
                allowMultiple={true}
                selectionLimit={3}
                value={watch("gotoFavPhotoUri")}
              />
            )}
            name="gotoFavPhotoUri"
          />
        </View>
        <View style={styles.footer}>
          <Pressable
            style={styles.button}
            onPress={async () => {
              // Manually check the validation
              if (await trigger()) {
                // Use the build in validation
                handleSubmit(
                  async () => await saveSettings(),
                  () => {
                    Alert.alert(
                      "Field Errors",
                      "There are some fields that have some errors."
                    );
                  }
                );
              } else {
                Alert.alert(
                  "Field Errors",
                  "There are some fields that have some errors."
                );
              }
            }}
          >
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </Page>
  );
}
