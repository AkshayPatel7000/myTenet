import {StyleSheet} from 'react-native';

export const getStyles = colors =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 50,
    },
    pendingSummaryContainer: {
      backgroundColor: colors.error,
      padding: 15,
      borderRadius: 8,
      marginBottom: 15,
    },
    pendingSummaryText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    roomCard: {
      backgroundColor: '#fff',
      width: '100%',
      padding: 10,
      borderRadius: 12,
      elevation: 10,
    },
    monthText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
    },
    detailContainer: {
      paddingVertical: 10,
      paddingHorizontal: 5,
    },
    textInfoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 5,
    },
    title: {
      fontSize: 14,
      fontWeight: '500',
    },
    totalBillTitle: {
      fontSize: 16,
      fontWeight: '500',
    },
    textInfoContainerTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 5,
      borderTopColor: colors.primary,
      paddingTop: 10,
      borderTopWidth: 1,
    },
    totalBillAmount: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primary,
    },
    imageContainer: {
      height: 200,
    },
    image: {
      flex: 1,
      borderTopRightRadius: 8,
      borderTopLeftRadius: 8,
    },
    statusContainer: {
      position: 'absolute',
      right: 10,
      top: 10,
      borderRadius: 50,
    },
    statusText: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      color: '#fff',
      fontWeight: '500',
    },
    actionButtonsContainer: {
      flexDirection: 'row',
    },
    paymentButtonsContainer: {
      position: 'absolute',
      left: 10,
      flexDirection: 'row',
      gap: 5,
    },
    paymentButton: {
      margin: 0,
      backgroundColor: colors.primary,
    },
    separator: {
      height: 15,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 150,
    },

  });
