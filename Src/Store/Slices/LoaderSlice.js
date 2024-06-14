import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  isDarkMode: false,
  searchTerm: '',
};

const slice = createSlice({
  name: 'Loader',
  initialState,
  reducers: {
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setIsDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
  },
});

export const {setIsLoading, setIsDarkMode, setSearchTerm} = slice.actions;

export default slice.reducer;

export const selectIsLoading = state => state.Loader.isLoading;
export const selectIsDarkTheme = state => state.Loader.isDarkMode;
export const selectSearchTerm = state => state.Loader.searchTerm;
