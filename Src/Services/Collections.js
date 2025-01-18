import firestore from '@react-native-firebase/firestore';
import {
  generateUniqueId,
  showError,
  showSuccess,
  sortByTimestamp,
} from '../Utils/helperFunction';
import {store} from '../Store/MainStore';
import {
  setHomeData,
  setRoomTenantRecords,
  setRoomTenants,
  setSelectedRoom,
  setSelectedTenant,
  setUserProfile,
  setUserRooms,
} from '../Store/Slices/AuthSlice';
import moment from 'moment';
const addUser = async user => {
  const {uid, email, displayName, photoURL} = user;
  try {
    const data = await firestore()
      .collection('users')
      .doc(uid)
      .set({
        uid,
        email,
        name: displayName || '',
        picture: photoURL || '',
      });
    console.log('🚀 ~ addUser ~ data:', data);

    if (data?._documentPath._parts?.at(-1)) {
      showSuccess('addUser has been Added');
    }
  } catch (error) {
    console.log('🚀 ~ addUser ~ error:', error);
  }
};
const getUser = async userId => {
  try {
    const userID = userId || store?.getState()?.AuthSlice?.userProfile?.uid;
    const data = await firestore().collection('users').doc(userID).get();
    if (data?.exists) {
      // console.log('🚀 ~ getUser ~ if data:', {...data.data(), uid: userId});
      // showSuccess('User Found');
      store.dispatch(setUserProfile({...data.data(), uid: userID}));
    } else {
      console.log('🚀 ~ getUser ~ else:', data);
      showError('User Not Found');
    }
  } catch (error) {
    showError('User Not Found');
    console.log('🚀 ~ getUser ~ error:', error);
  }
};
const updateUser = async user => {
  try {
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;
    const data = await firestore()
      .collection('users')
      .doc(userId)
      .update({
        ...user,
      });
    await getUser(userId);
    showSuccess('User details has been updated');
  } catch (error) {
    console.log('🚀 ~ updateUser ~ error:', error);
  }
};
const getUserRooms = async () => {
  try {
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;
    const data = await firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms')
      .get();
    if (data?.docs) {
      const newdata = data?.docs.map(e => ({...e.data(), roomId: e.id}));
      // console.log('🚀 ~ getUserRooms ~ if data:', newdata);

      store.dispatch(setUserRooms(sortByTimestamp(newdata)));
      // showSuccess('User Rooms Found');
    } else {
      console.log('🚀 ~ getUserRooms ~ else:', data);
      showError('User Rooms Not Found');
    }
  } catch (error) {
    console.log('🚀 ~ getUserRooms ~ error:', error);
    showError('User Rooms Not Found');
  }
};
const getRoomDetails = async roomId => {
  try {
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;
    const data = await firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms')
      .doc(roomId)
      .get();
    if (data?.exists) {
      store.dispatch(setSelectedRoom({...data.data(), roomId}));
      console.log(data.data());
      // showSuccess('User Rooms Found');
    } else {
      console.log('🚀 ~ getRoomDetails ~ else:', data);
      showError('User Rooms Not Found');
    }
  } catch (error) {
    console.log('🚀 ~ getRoomDetails ~ error:', error);
    showError('User Rooms Not Found');
  }
};
const addUserRoom = async room => {
  try {
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;
    const data = await firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms')
      .add({
        ...room,
        createdAt: Date.now(),
        currentTenantId: '',
      });
    if (data._documentPath._parts.at(-1)) {
      showSuccess('Room has been Added');
      getUserRooms();
    }
  } catch (error) {
    console.log('🚀 ~ addUserRoom ~ error:', error);
  }
};
const updateUserRoom = async updateData => {
  try {
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;
    const roomId = store?.getState()?.AuthSlice?.selectedRoom.roomId;
    const data = await firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms')
      .doc(roomId)
      .update({
        ...updateData,
      });
    console.log('🚀 ~ updateUserRoom ~ data:', data);
    await getRoomDetails(roomId);
    //   if (data._documentPath._parts.at(-1)) {
    //     showSuccess('Room has been Added');
    //   }
  } catch (error) {
    console.log('🚀 ~ updateUserRoom ~ error:', error);
  }
};
const removeUserRoom = async roomID => {
  try {
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;
    const roomId = roomID;
    console.log('🚀 ~ removeUserRoom ~ roomId:', roomId);
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms')
      .doc(roomId)
      .delete();

    await getUserRooms();
    showSuccess('Room Deleted');
  } catch (error) {
    console.log('🚀 ~ updateUserRoom ~ error:', error);
  }
};
const getUserRoomsTenants = async () => {
  try {
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;
    const roomId = store?.getState()?.AuthSlice?.selectedRoom.roomId;
    const data = await firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms')
      .doc(roomId)
      .collection('Tenants')
      .get();
    if (data?.docs) {
      const newdata = data?.docs.map(e => ({...e.data(), tenantId: e.id}));
      store.dispatch(setRoomTenants(sortByTimestamp(newdata, true)));
      // showSuccess('Tenants Rooms Found');
    } else {
      console.log('🚀 ~ getUserRoomsTenants ~ else:', data);
      showError('Tenants Rooms Not Found');
    }
  } catch (error) {
    console.log('🚀 ~ getUserRoomsTenants ~ error:', error);
    showError('Tenants Rooms Not Found');
  }
};
const getUserRoomsTenantsDetails = async tenantId => {
  try {
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;
    const roomId = store?.getState()?.AuthSlice?.selectedRoom.roomId;
    const data = await firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms')
      .doc(roomId)
      .collection('Tenants')
      .doc(tenantId)
      .get();
    if (data?.exists) {
      console.log({...data.data(), tenantId});
      store.dispatch(setSelectedTenant({...data.data(), tenantId}));
      //   showSuccess('User Rooms Found');
    } else {
      console.log('🚀 ~ getUserRoomsTenantsDetails ~ else:', data);
      showError('Tenant Not Found');
    }
  } catch (error) {
    console.log('🚀 ~ getUserRoomsTenantsDetails ~ error:', error);
    showError('Tenant Not Found');
  }
};
const addRoomTenet = async (tenet, roomID) => {
  try {
    const roomId = roomID || store?.getState()?.AuthSlice?.selectedRoom.roomId;
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;
    const data = await firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms')
      .doc(roomId)
      .collection('Tenants')
      .add({
        ...tenet,
        startDate: moment(tenet?.startDate).format('DD-MMMM-YYYY'),
        createdAt: Date.now(),
      });
    if (data._documentPath._parts.at(-1)) {
      console.log(
        '🚀 ~ addRoomTenet ~ data:',
        data._documentPath._parts.at(-1),
      );
      await updateUserRoom({
        currentTenantId: data._documentPath._parts.at(-1),
        tenetName: tenet?.name,
        startDate: moment(tenet?.startDate).format('DD-MMMM-YYYY'),
      });

      await getUserRoomsTenants();
      showSuccess('Room has been Added');
      return data;
    }
    return {};
  } catch (error) {
    console.log('🚀 ~ addUserRoom ~ error:', error);
    return error;
  }
};
const updateRoomTenet = async (updateData, userData) => {
  try {
    const roomId = store?.getState()?.AuthSlice?.selectedRoom.roomId;
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;

    const data = await firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms')
      .doc(roomId)
      .collection('Tenants')
      .doc(userData.tenantId)
      .update({
        ...updateData,
        startDate: moment(updateData?.startDate).format('DD-MMMM-YYYY'),
      });
    console.log({
      currentTenantId: userData.tenantId,
      tenetName: updateData?.name,
      startDate: updateData?.startDate,
    });
    await updateUserRoom({
      currentTenantId: userData.tenantId,
      tenetName: updateData?.name,
      startDate: moment(updateData?.startDate).format('DD-MMMM-YYYY'),
    });
    await getUserRoomsTenants();

    return data;
  } catch (error) {
    console.log('🚀 ~ addUserRoom ~ error:', error);
    return error;
  }
};
const removeRoomTenet = async userData => {
  try {
    const roomId = store?.getState()?.AuthSlice?.selectedRoom.roomId;
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;

    const data = await firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms')
      .doc(roomId)
      .collection('Tenants')
      .doc(userData.tenantId)
      .delete();
    await getUserRoomsTenants();
    showSuccess('Tenet Deleted');
    return data;
  } catch (error) {
    console.log('🚀 ~ removeRoomTenet ~ error:', error);
    return error;
  }
};

const addUserRoomsTenantsRecord = async values => {
  try {
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;
    const roomId = store?.getState()?.AuthSlice?.selectedRoom.roomId;
    const tenantId = store?.getState()?.AuthSlice?.selectedTenant?.tenantId;
    const selectedRoom = store?.getState()?.AuthSlice?.selectedRoom;
    const payload = {
      paidStatus: false,
      image: values?.url,
      currentReading: values?.newReading,
      previousReading: Number(selectedRoom?.startReading),
      totalUnitBurned:
        Number(values.newReading) - Number(selectedRoom?.startReading),
      perUnit: Number(selectedRoom?.perUnit),
      totalAmount:
        (Number(values.newReading) - Number(selectedRoom?.startReading)) *
        Number(selectedRoom?.perUnit),
      note: values?.note,
    };
    console.log('🚀 ~ addUserRoomsTenantsRecord ~ selectedRoom:', payload);
    const data = await firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms')
      .doc(roomId)
      .collection('Tenants')
      .doc(tenantId)
      .collection('record')
      .add({
        ...payload,
        createdAt: Date.now(),
      });

    if (data._documentPath._parts.at(-1)) {
      await updateUserRoom({startReading: values?.newReading});
      console.log(
        '🚀 ~ getUserRoomsTenantsRecord ~ if data:',
        data._documentPath._parts,
      );
      await getUserRoomsTenantsRecord();
      showSuccess('Record Added Successfully');
    } else {
      console.log('🚀 ~ getUserRoomsTenantsRecord ~ else:', data);
      showError('Tenants Rooms Not Found');
    }
  } catch (error) {
    console.log('🚀 ~ getUserRoomsTenantsRecord ~ error:', error);
    showError('Tenants Rooms Not Found');
  }
};
const markAsPaidRecord = async record => {
  try {
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;
    const roomId = store?.getState()?.AuthSlice?.selectedRoom.roomId;
    const tenantId = store?.getState()?.AuthSlice?.selectedTenant?.tenantId;
    const data = await firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms')
      .doc(roomId)
      .collection('Tenants')
      .doc(tenantId)
      .collection('record')
      .doc(record.recordId)
      .update({
        paidStatus: true,
      });
    await updateRoomTenet(
      {
        lastPaidDate: record.createdAt,
        lastPaidAmount: record.totalAmount,
      },
      {tenantId},
    );
    await getUserRoomsTenantsRecord();
    showSuccess('Record Added Successfully');
  } catch (error) {
    console.log('🚀 ~ getUserRoomsTenantsRecord ~ error:', error);
    showError('Tenants Rooms Not Found');
  }
};
const getUserRoomsTenantsRecord = async () => {
  try {
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;
    const roomId = store?.getState()?.AuthSlice?.selectedRoom.roomId;
    const tenantId = store?.getState()?.AuthSlice?.selectedTenant?.tenantId;
    const data = await firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms')
      .doc(roomId)
      .collection('Tenants')
      .doc(tenantId)
      .collection('record')
      .get();
    if (data?.docs) {
      const newdata = data?.docs.map(e => ({...e.data(), recordId: e.id}));
      // console.log('🚀 ~ getUserRooms ~ if data:', newdata);

      store.dispatch(setRoomTenantRecords(sortByTimestamp(newdata, true)));
      // showSuccess('User Rooms Found');
    } else {
      console.log('🚀 ~ getUserRooms ~ else:', data);
    }
  } catch (error) {
    console.log('🚀 ~ getUserRooms ~ error:', error);
    // showError('User Rooms Not Found');
  }
};
const getRoomT = async e => {
  try {
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;
    const rooms = firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms');
    const tenant = await rooms
      .doc(e.id)
      .collection('Tenants')
      .doc(e.data()?.currentTenantId)
      .get();
    const tenantRecords = await rooms
      .doc(e.id)
      .collection('Tenants')
      .doc(e.data()?.currentTenantId)
      .collection('record')
      .get();
    const newRecordData = tenantRecords.docs.map(rec => ({
      ...rec.data(),
      recordId: rec.id,
    }));
    return {...tenant.data(), records: newRecordData};
  } catch (error) {
    console.log('🚀 ~ getRoomT ~ error:', error);
  }
};
const getData = async () => {
  try {
    const userId = store?.getState()?.AuthSlice?.userProfile?.uid;
    const rooms = firestore()
      .collection('users')
      .doc(userId)
      .collection('rooms');

    rooms
      .get()
      .then(async room => {
        const roomsData = room?.docs.map(async e => {
          const d = await getRoomT(e);

          return {
            ...e.data(),
            roomId: e.id,
            tenet: {...d},
          };
        });
        const pro = await Promise.all(roomsData);
        store.dispatch(setHomeData(pro));
      })
      .catch(err => {
        console.log('🚀 ~ .get ~ err:', err);
      });
  } catch (error) {
    console.log('🚀 ~ getData ~ error:', error);
  }
};
export {
  addUser,
  getUser,
  getUserRooms,
  getRoomDetails,
  getUserRoomsTenants,
  addUserRoom,
  getUserRoomsTenantsDetails,
  updateUserRoom,
  addRoomTenet,
  addUserRoomsTenantsRecord,
  getUserRoomsTenantsRecord,
  markAsPaidRecord,
  getData,
  updateUser,
  updateRoomTenet,
  removeRoomTenet,
  removeUserRoom,
};
