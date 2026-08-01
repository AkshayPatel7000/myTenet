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
  const {colors, dark} = useTheme();
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
        contentContainerStyle={[
          styles.sheetContainer,
          {backgroundColor: colors.surface},
        ]}>
        <View
          style={[
            styles.sheetPill,
            {backgroundColor: colors.outlineVariant || '#CBD5E1'},
          ]}
        />

        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <Text style={[styles.modalTitleText, {color: colors.onSurface}]}>
              Tenant Bill Receipt
            </Text>
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
            style={[
              styles.receiptCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant || '#E2E8F0',
              },
            ]}>
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
            <View
              style={[
                styles.heroAmountBox,
                {
                  backgroundColor: dark ? '#312E81' : '#EEF2FF',
                  borderBottomColor: dark ? '#4338CA' : '#E0E7FF',
                },
              ]}>
              <Text style={[styles.heroAmountLabel, {color: colors.primary}]}>
                TOTAL AMOUNT PAYABLE
              </Text>
              <Text style={[styles.heroAmountValue, {color: dark ? '#EEF2FF' : '#1E1B4B'}]}>
                ₹ {finalPayable}
              </Text>
            </View>

            {/* Simple Breakdown List */}
            <View style={styles.breakdownBox}>
              <View
                style={[
                  styles.lineItem,
                  {borderBottomColor: colors.outlineVariant || '#F1F5F9'},
                ]}>
                <View style={styles.itemLabelGroup}>
                  <Icon source="home-city" size={18} color={colors.primary} />
                  <Text style={[styles.itemLabel, {color: colors.onSurface}]}>
                    Room Rent
                  </Text>
                </View>
                <Text style={[styles.itemValue, {color: colors.onSurface}]}>
                  ₹ {billData?.roomRent || 0}
                </Text>
              </View>

              <View
                style={[
                  styles.lineItem,
                  {borderBottomColor: colors.outlineVariant || '#F1F5F9'},
                ]}>
                <View style={styles.itemLabelGroup}>
                  <Icon source="lightning-bolt" size={18} color={colors.primary} />
                  <Text style={[styles.itemLabel, {color: colors.onSurface}]}>
                    Electricity ({billData?.units || 0} units)
                  </Text>
                </View>
                <Text style={[styles.itemValue, {color: colors.onSurface}]}>
                  ₹ {billData?.eleBill || 0}
                </Text>
              </View>

              {billData?.previousPendingAmount > 0 ? (
                <View
                  style={[
                    styles.lineItem,
                    {borderBottomColor: colors.outlineVariant || '#F1F5F9'},
                  ]}>
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
            <View
              style={[
                styles.paymentBox,
                {
                  backgroundColor: dark ? '#334155' : '#F8FAFC',
                  borderColor: colors.outlineVariant || '#E2E8F0',
                },
              ]}>
              <Text style={[styles.paymentBoxTitle, {color: colors.onSurfaceVariant}]}>
                Pay To Landlord:
              </Text>

              {billData?.upi ? (
                <View style={styles.paymentRow}>
                  <Text style={[styles.payLabel, {color: colors.onSurfaceVariant}]}>UPI ID:</Text>
                  <Text style={[styles.payValue, {color: colors.onSurface}]}>{billData?.upi}</Text>
                </View>
              ) : null}

              {billData?.phone ? (
                <View style={styles.paymentRow}>
                  <Text style={[styles.payLabel, {color: colors.onSurfaceVariant}]}>Mobile No:</Text>
                  <Text style={[styles.payValue, {color: colors.onSurface}]}>{billData?.phone}</Text>
                </View>
              ) : null}
            </View>

            {/* Meter Photo Thumbnail if available */}
            {billImage ? (
              <View style={styles.meterPhotoContainer}>
                <Text style={[styles.meterPhotoTitle, {color: colors.onSurfaceVariant}]}>
                  Meter Reading Photo:
                </Text>
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
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  receiptCard: {
    borderRadius: 20,
    borderWidth: 1,
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
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  heroAmountLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroAmountValue: {
    fontSize: 32,
    fontWeight: '900',
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
  },
  itemLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  paymentBox: {
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  paymentBoxTitle: {
    fontSize: 12,
    fontWeight: '800',
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
    fontWeight: '500',
  },
  payValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  meterPhotoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  meterPhotoTitle: {
    fontSize: 11,
    fontWeight: '600',
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
