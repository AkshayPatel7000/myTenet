import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  authToken: '',
  userData: {},
  userProfile: {},
  userRooms: [],
  selectedRoom: {},
  roomTenants: [],
  selectedTenant: {},
  roomTenantRecords: [],
  homeData: [],
};

const slice = createSlice({
  name: 'Auth',
  initialState,
  reducers: {
    setAuthToken: (state, action) => {
      state.authToken = action.payload;
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    setUserRooms: (state, action) => {
      state.userRooms = action.payload;
    },
    setSelectedRoom: (state, action) => {
      state.selectedRoom = action.payload;
    },
    setRoomTenants: (state, action) => {
      state.roomTenants = action.payload;
    },
    setSelectedTenant: (state, action) => {
      state.selectedTenant = action.payload;
    },
    setRoomTenantRecords: (state, action) => {
      state.roomTenantRecords = action.payload;
    },
    setHomeData: (state, action) => {
      state.homeData = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    resetAuthSlice: (state, action) => {
      state = {
        authToken: '',
        userData: {},
        userProfile: {},
        userRooms: [],
        selectedRoom: {},
        roomTenants: [],
        selectedTenant: {},
        roomTenantRecords: [],
        homeData: [],
      };
    },
  },
});

export const {
  setAuthToken,
  setUserProfile,
  setDepartments,
  setUserRooms,
  setSelectedRoom,
  setSelectedTenant,
  setRoomTenants,
  setRoomTenantRecords,
  setHomeData,
  setUserData,
  resetAuthSlice,
} = slice.actions;

export default slice.reducer;

export const selectAuthToken = state => state.AuthSlice.authToken;
export const selectUserData = state => state.AuthSlice.userData;
export const selectUserProfile = state => state.AuthSlice.userProfile;
export const selectUserRooms = state => state.AuthSlice.userRooms;
export const selectSelectedRoom = state => state.AuthSlice.selectedRoom;
export const selectSelectedTenant = state => state.AuthSlice.selectedTenant;
export const selectRoomTenants = state => state.AuthSlice.roomTenants;
export const selectHomeData = state => state.AuthSlice.homeData;

export const selectRoomTenantRecords = state =>
  state.AuthSlice.roomTenantRecords;
