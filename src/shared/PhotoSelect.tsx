import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Pressable, Text, View, Image } from "react-native";
import styles from "../styles/style";
import { useEffect } from "react";

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
  const [imgUri, setImgUri] = useState<string | null>(null);
  const [multiImgUri, setMultiImgUri] = useState<string[] | null>([]);

  useEffect(() => {
    if (allowMultiple) {
      setMultiImgUri(value as string[]);
    } else {
      setImgUri(value as string);
    }
  }, [value]);
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

  const renderImg = function () {
    if (allowMultiple && multiImgUri && multiImgUri.length > 0) {
      return multiImgUri.map((imgUri, idx) => {
        return (
          <Image
            source={{ uri: imgUri }}
            style={{ width: 200, height: 200, marginBottom: 10 }}
            key={idx}
          />
        );
      });
    } else if (imgUri != null && !allowMultiple) {
      return (
        <Image source={{ uri: imgUri }} style={{ width: 200, height: 200 }} />
      );
    } else {
      return (
        <View style={styles.button}>
          <Text style={styles.buttonText}>Upload a photo</Text>
        </View>
      );
    }
  };

  return (
    <View>
      <Pressable
        style={{ alignItems: "center", marginVertical: 10 }}
        onPress={pickImage}
      >
        {renderImg()}
      </Pressable>
    </View>
  );
};
export default PhotoSelect;
