import { createSlice, configureStore } from "@reduxjs/toolkit";

const initialState = {
  isSidebarCollapsed: false,
  userLogged: null,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action) => {
      state.isSidebarCollapsed = action.payload;
    },
    setUserLogged: (state, action) => {
      state.userLogged = action.payload;
    },
  },
});

const store = configureStore({
  reducer: globalSlice.reducer,
});

export const { setIsSidebarCollapsed, setUserLogged } = globalSlice.actions;
export { store };

store.subscribe(() => console.log("store.getState()", store.getState()));
