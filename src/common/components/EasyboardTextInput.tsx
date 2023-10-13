import { TextInput, Text, TextInputProps } from "react-native";
import { styled } from "nativewind";
import { Feather } from "@expo/vector-icons";

const StyledTextInput = styled(TextInput);

const EasyboardTextInput = (props: TextInputProps) => {
  return (
    <StyledTextInput
      className="rounded-sm border-[0.5px] px-2 py-3 border-textInputBorder text-black text-md"
      {...props}
    />
  );
};
export default EasyboardTextInput;
