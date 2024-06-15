import * as React from 'react';
import {View} from 'react-native';
import {Button, Dialog, Portal, PaperProvider, Text} from 'react-native-paper';

const MyDialog = ({
  visible,
  setVisible,
  title,
  body,
  doneTitle = 'Done',
  cancelTitle = 'Cancel',
  donePress = () => {},
}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={() => setVisible(false)}>
        {title && <Dialog.Title>{title}</Dialog.Title>}
        {body && (
          <Dialog.Content>
            <Text variant="bodyMedium">{body}</Text>
          </Dialog.Content>
        )}
        <Dialog.Actions>
          <Button onPress={() => setVisible(false)}>{cancelTitle}</Button>

          <Button onPress={donePress}>{doneTitle}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default MyDialog;
