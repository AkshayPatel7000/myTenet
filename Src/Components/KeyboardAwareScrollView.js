import React, {useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

const KeyboardAwareScrollView = ({
  children,
  contentContainerStyle,
  style,
  extraScrollHeight = 80,
  ...props
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      setKeyboardHeight(e.endCoordinates.height || 280);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <ScrollView
      ref={scrollViewRef}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={[styles.scrollView, style]}
      contentContainerStyle={[
        contentContainerStyle,
        keyboardHeight > 0 && {paddingBottom: keyboardHeight + extraScrollHeight},
      ]}
      {...props}>
      {children}
    </ScrollView>
  );
};

export default KeyboardAwareScrollView;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
