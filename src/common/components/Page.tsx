/**
 * This file serves as a catch-all, generic component that pages should use as a base
 * It incorporates SafeAreaView (can be disabled) for iOs devices & scrollview for interactivity
 */
import { ReactNode } from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import styles from "../../styles/style";

interface Props {
  children: ReactNode;
  disableScroll?: boolean;
}
const Page = ({ children, disableScroll }: Props) => (
  <SafeAreaView className="flex-1 bg-white">
    {disableScroll ? (
      <View style={styles.container}>{children}</View>
    ) : (
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    )}
  </SafeAreaView>
);
export default Page;
