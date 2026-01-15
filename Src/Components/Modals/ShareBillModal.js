import React, {useRef} from 'react';
import {View, ScrollView, StyleSheet, Image, Alert} from 'react-native';
import {
  Portal,
  Modal,
  Text,
  Button,
  Divider,
  useTheme,
  IconButton,
} from 'react-native-paper';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';

const ShareBillModal = ({visible, hideModal, billData, billImage}) => {
  console.log('🚀 ~ ShareBillModal ~ billData:', billData);
  const {colors} = useTheme();
  const viewShotRef = useRef();

  const handleShare = async () => {
    try {
      // Capture the view as an image
      const uri = await viewShotRef.current.capture();

      // Share the image
      const shareOptions = {
        title: 'Monthly Rent & Electricity Bill',
        message: `Hi ${billData.name},

Please find your bill for ${billData.date} below.`,
        url: `file://${uri}`,
        type: 'image/png',
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.log('Error sharing:', error);
      if (error.message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share bill. Please try again.');
      }
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={[
          styles.modalContainer,
          {backgroundColor: colors.surface},
        ]}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Bill Details
          </Text>
          <IconButton icon="close" size={24} onPress={hideModal} />
        </View>

        <ScrollView style={styles.scrollView}>
          <ViewShot ref={viewShotRef} options={{format: 'png', quality: 0.9}}>
            <View style={styles.captureContainer}>
              {/* Bill Image */}
              {billImage && (
                <View style={styles.imageContainer}>
                  <Image source={{uri: billImage}} style={styles.billImage} />
                </View>
              )}

              {/* Bill Breakdown */}
              <View style={styles.billContainer}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Rent & Electricity Bill
                </Text>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  {billData.date}
                </Text>

                <Divider style={styles.divider} />

                {/* Meter Readings */}
                <View style={styles.row}>
                  <Text style={styles.label}>Old Reading</Text>
                  <Text style={styles.value}>{billData.oldReading}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>New Reading</Text>
                  <Text style={styles.value}>{billData.newReading}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Units Used</Text>
                  <Text style={styles.value}>{billData.units}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Electricity Bill</Text>
                  <Text style={styles.value}>₹ {billData.eleBill}</Text>
                </View>

                <Divider style={styles.divider} />

                {/* Room Rent */}
                <View style={styles.row}>
                  <Text style={styles.label}>Rent</Text>
                  <Text style={styles.value}>₹ {billData.roomRent}</Text>
                </View>

                {/* Pending Amount
                {billData.pendingAmount > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Extra / Misc</Text>
                    <Text style={[styles.value, {color: '#d32f2f'}]}>
                      ₹ {billData.pendingAmount}
                    </Text>
                  </View>
                )} */}

                {/* Total Amount */}
                <View style={[styles.row, styles.totalRow]}>
                  <Text style={styles.totalLabel}>This Month Total</Text>
                  <Text style={styles.totalValue}>₹ {billData.amount}</Text>
                </View>

                {/* Previous Pending Amount */}
                {billData.previousPendingAmount > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Previous Due</Text>
                    <Text style={[styles.value, {color: '#d32f2f'}]}>
                      ₹ {billData.previousPendingAmount}
                    </Text>
                  </View>
                )}

                {/* Total Pending Amount */}
                {billData.totalPendingAmount > 0 && (
                  <View style={[styles.row, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Payable</Text>
                    <Text style={[styles.totalValue, {color: '#d32f2f'}]}>
                      ₹ {billData.totalPendingAmount}
                    </Text>
                  </View>
                )}

                <Divider style={styles.divider} />

                {/* Payment Info */}
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentText}>
                    Please pay your bill on time to:
                  </Text>
                  <Text style={styles.paymentDetail}>
                    Mobile: <Text style={styles.bold}>{billData.phone}</Text>
                  </Text>
                  <Text style={styles.paymentDetail}>
                    UPI: <Text style={styles.bold}>{billData.upi}</Text>
                  </Text>
                </View>
              </View>
            </View>
          </ViewShot>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleShare}
            icon="share-variant"
            style={styles.shareButton}>
            Share Bill
          </Button>
          <Button
            mode="outlined"
            onPress={hideModal}
            style={styles.closeButton}>
            Close
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  captureContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
  },
  imageContainer: {
    marginVertical: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  billImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  billContainer: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  divider: {
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 14,
    marginBottom: 8,
  },
  paymentDetail: {
    fontSize: 14,
    marginVertical: 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    gap: 8,
  },
  shareButton: {
    marginBottom: 8,
  },
  closeButton: {
    marginBottom: 8,
  },
});

export default ShareBillModal;
