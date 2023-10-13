import { useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Pressable, Text, View, Image, ScrollView } from "react-native";
import styles from "../styles/style";
import { useEffect } from "react";
import ImageUploadButton from "./components/ImageUploadButton";

interface Props {
  imgChange: (imgUri: string | string[]) => void;
  allowMultiple?: boolean;
  selectionLimit?: number;
  value: string | string[] | null;
}

const PhotoSelect = ({
  imgChange,
  allowMultiple,
  selectionLimit,
  value,
}: Props) => {
  const [imgUri, setImgUri] = useState<string | null>("");
  const [multiImgUri, setMultiImgUri] = useState<string[] | null>([]);

  // This effect listens for upload event from our parent form
  useEffect(() => {
    if (allowMultiple) {
      setMultiImgUri(value as string[]);
    } else {
      if (value) {
        setImgUri(value as string);
      }
    }
  }, [value]);

  const fileName = useMemo(() => {
    if (imgUri) {
      const strArr = imgUri?.split("/") ?? [];
      return strArr[strArr.length - 1];
    }
    if (allowMultiple && multiImgUri) {
      const fileNames = multiImgUri?.map((file) => {
        const strArr = file.split("/");
        return strArr[strArr.length - 1];
      });
      if (fileNames) {
        return fileNames.join(", ");
      }
    }
  }, [imgUri, multiImgUri, allowMultiple]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: allowMultiple,
      selectionLimit: allowMultiple ? selectionLimit : 0,
      quality: 1,
    });

    if (result && !result.canceled) {
      if (allowMultiple) {
        const imgUris = result.assets.map((img) => img.uri);
        setMultiImgUri(imgUris);
        imgChange(imgUris);
      } else {
        if (result.assets[0]) {
          setImgUri(result.assets[0].uri);
          imgChange(result.assets[0].uri);
        }
      }
    }
  };

  // Render Images if available
  const renderUploadedImages = useMemo(() => {
    // Multiple Images
    if (allowMultiple && multiImgUri && multiImgUri.length > 0) {
      return (
        <ScrollView horizontal>
          {multiImgUri.map(
            (imgUri) =>
              imgUri.length > 0 && (
                <Image
                  source={{ uri: imgUri }}
                  className="mr-4 mt-4 h-20 w-20"
                  key={imgUri}
                />
              )
          )}
        </ScrollView>
      );
    }
    // Single Image
    if (imgUri != null && imgUri.length > 0 && !allowMultiple) {
      return (
        <Image
          source={{ uri: imgUri }}
          className="mr-4 mt-4 h-20 w-20"
          key={imgUri}
        />
      );
    }
  }, [imgUri, allowMultiple, multiImgUri]);

  return (
    <View>
      <ImageUploadButton onPress={pickImage} value={fileName} />
      {renderUploadedImages}
    </View>
  );
};
export default PhotoSelect;
