import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Dialog, Portal, Text, TextInput} from 'react-native-paper';

const PartialPaymentModal = ({
  visible,
  hideModal,
  onSave,
  totalAmount,
  recordId,
}) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const paidAmount = Number(amount);
    if (!paidAmount || paidAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (paidAmount > totalAmount) {
      setError('Amount cannot be greater than the total amount');
      return;
    }
    const pendingAmount = totalAmount - paidAmount;
    onSave({recordId, paidAmount, pendingAmount});
    setAmount('');
    setError('');
    hideModal();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideModal}>
        <Dialog.Title>Partial Payment</Dialog.Title>
        <Dialog.Content>
          <View style={styles.container}>
            <Text style={styles.totalAmount}>
              This Month Total: ₹{totalAmount}
            </Text>
            <TextInput
              label="Amount Paid"
              value={amount}
              onChangeText={text => {
                setAmount(text);
                setError('');
              }}
              keyboardType="numeric"
              style={styles.input}
              error={!!error}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideModal}>Cancel</Button>
          <Button onPress={handleSave}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default PartialPaymentModal;

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
  },
  input: {
    marginBottom: 10,
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
});
