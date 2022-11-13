import { useState } from 'react';
import * as ImagePicker from "expo-image-picker";
import { Pressable, Text, View, Image } from "react-native";
import styles from "../styles/style"
import { useEffect } from 'react';


export default function PhotoSelect({imgChange, allowMultiple, selectionLimit, value}) {
  const [imgUri, setImgUri] = useState(null)
  const [multiImgUri, setMultiImgUri] = useState([])

  useEffect(() => {
    if(allowMultiple){
      setMultiImgUri(value)
    }else{
      setImgUri(value)
    }
  }, [value])
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: allowMultiple,
      selectionLimit: allowMultiple? selectionLimit : 0,
      quality: 1,
    });
  
    if (!result.cancelled) {
      if(allowMultiple){
        const imgUris = result.selected.map(img => img.uri)
        setMultiImgUri(imgUris)
        imgChange(imgUris)
      }else{
        setImgUri(result.uri)
        imgChange(result.uri)
      }
        
    }
  };

  const renderImg = function(){
    if(allowMultiple && multiImgUri.length > 0){
      return multiImgUri.map((imgUri, idx) => {
        return <Image source={{ uri: imgUri }} style={{ width: 200, height: 200, marginBottom: 10}} key={idx} />
      })
    }else if(imgUri != null && !allowMultiple){
      return <Image source={{ uri: imgUri }} style={{ width: 200, height: 200 }} />
    }else{
      return (
        <View style={styles.button}>
          <Text style={styles.buttonText}>Upload a photo</Text>
        </View>
      )
    }
  }

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
}
