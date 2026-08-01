import React, {useRef} from 'react';
import {Alert, Image, ScrollView, StyleSheet, View} from 'react-native';
import {
  Button,
  Icon,
  IconButton,
  Modal,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';

const ShareBillModal = ({visible, hideModal, billData, billImage}) => {
  const {colors} = useTheme();
  const viewShotRef = useRef();

  const finalPayable =
    billData?.totalPendingAmount > 0
      ? billData?.totalPendingAmount
      : billData?.amount || 0;

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();

      const shareOptions = {
        title: 'Monthly Rent & Electricity Bill Receipt',
        message: `Hi ${billData?.name || 'Tenant'},

Here is your bill receipt for ${billData?.date || ''}:

Total Payable: ₹ ${finalPayable}
UPI ID: ${billData?.upi || 'N/A'}
Phone: ${billData?.phone || 'N/A'}

Thank you!`,
        url: `file://${uri}`,
        type: 'image/png',
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.log('Error sharing:', error);
      if (error.message !== 'User did not share') {
        Alert.alert(
          'Sharing Failed',
          'Could not share the receipt. Please try again.',
        );
      }
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={styles.sheetContainer}>
        <View style={styles.sheetPill} />

        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            {/* <Icon source="receipt-text-outline" size={22} color={colors.primary} /> */}
            <Text style={styles.modalTitleText}>Tenant Bill Receipt</Text>
          </View>
          <IconButton icon="close" size={20} onPress={hideModal} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Simple Printable Receipt Card */}
          <ViewShot
            ref={viewShotRef}
            options={{format: 'png', quality: 0.95}}
            style={styles.receiptCard}>
            {/* Header Banner */}
            <LinearGradient
              colors={['#4F46E5', '#6366F1']}
              useAngle={true}
              angle={135}
              style={styles.receiptHeader}>
              <Text style={styles.receiptBadge}>RENT & UTILITY RECEIPT</Text>
              <Text style={styles.tenantNameText}>
                {billData?.name || 'Tenant'}
              </Text>
              <Text style={styles.monthText}>{billData?.date || ''}</Text>
            </LinearGradient>

            {/* Hero Big Total Payable Amount */}
            <View style={styles.heroAmountBox}>
              <Text style={styles.heroAmountLabel}>TOTAL AMOUNT PAYABLE</Text>
              <Text style={styles.heroAmountValue}>₹ {finalPayable}</Text>
            </View>

            {/* Simple Breakdown List */}
            <View style={styles.breakdownBox}>
              <View style={styles.lineItem}>
                <View style={styles.itemLabelGroup}>
                  <Icon source="home-city" size={18} color="#4F46E5" />
                  <Text style={styles.itemLabel}>Room Rent</Text>
                </View>
                <Text style={styles.itemValue}>
                  ₹ {billData?.roomRent || 0}
                </Text>
              </View>

              <View style={styles.lineItem}>
                <View style={styles.itemLabelGroup}>
                  <Icon source="lightning-bolt" size={18} color="#4F46E5" />
                  <Text style={styles.itemLabel}>
                    Electricity ({billData?.units || 0} units)
                  </Text>
                </View>
                <Text style={styles.itemValue}>₹ {billData?.eleBill || 0}</Text>
              </View>

              {billData?.previousPendingAmount > 0 ? (
                <View style={styles.lineItem}>
                  <View style={styles.itemLabelGroup}>
                    <Icon source="alert-circle" size={18} color="#DC2626" />
                    <Text style={[styles.itemLabel, {color: '#DC2626'}]}>
                      Previous Pending Dues
                    </Text>
                  </View>
                  <Text style={[styles.itemValue, {color: '#DC2626'}]}>
                    ₹ {billData?.previousPendingAmount}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Simple Payment Instructions Box */}
            <View style={styles.paymentBox}>
              <Text style={styles.paymentBoxTitle}>Pay To Landlord:</Text>

              {billData?.upi ? (
                <View style={styles.paymentRow}>
                  <Text style={styles.payLabel}>UPI ID:</Text>
                  <Text style={styles.payValue}>{billData?.upi}</Text>
                </View>
              ) : null}

              {billData?.phone ? (
                <View style={styles.paymentRow}>
                  <Text style={styles.payLabel}>Mobile No:</Text>
                  <Text style={styles.payValue}>{billData?.phone}</Text>
                </View>
              ) : null}
            </View>

            {/* Meter Photo Thumbnail if available */}
            {billImage ? (
              <View style={styles.meterPhotoContainer}>
                <Text style={styles.meterPhotoTitle}>Meter Reading Photo:</Text>
                <Image source={{uri: billImage}} style={styles.meterPhoto} />
              </View>
            ) : null}
          </ViewShot>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <Button
              mode="contained"
              icon="whatsapp"
              buttonColor="#16A34A"
              textColor="#FFFFFF"
              style={styles.shareBtn}
              labelStyle={{fontWeight: '700', fontSize: 14}}
              onPress={handleShare}>
              Share Receipt Image to Tenant
            </Button>
            <Button mode="outlined" style={styles.closeBtn} onPress={hideModal}>
              Close
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

export default ShareBillModal;

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '88%',
  },
  sheetPill: {
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  receiptHeader: {
    padding: 18,
    alignItems: 'center',
  },
  receiptBadge: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  tenantNameText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  monthText: {
    color: '#C7D2FE',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  heroAmountBox: {
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
  },
  heroAmountLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 1,
  },
  heroAmountValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E1B4B',
    marginTop: 2,
  },
  breakdownBox: {
    padding: 16,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 8,
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentBoxTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  payLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  payValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  meterPhotoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  meterPhotoTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  meterPhoto: {
    width: '100%',
    height: 110,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  actionRow: {
    gap: 8,
    marginTop: 4,
  },
  shareBtn: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  closeBtn: {
    borderRadius: 12,
  },
});
