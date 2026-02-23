import { createSlice } from "@reduxjs/toolkit";

//initial state of the authentication portal
const initialState = {
  user: null,
  isAuthenticated: false,
};

//here the Redux module where reducers get defined
//each reducers function receives by default parameters state AND action
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    //loginSuccess is being called after main login was succesfull
    //adica, dupa ce backendul meu a returnat userul cu succes (credentialele introduse = credentialele din DB)
    loginSuccess(state, action) {
      //action.payload = userul returnat de backend
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.user = null; //we don't have action.payload because there's nothing to be sent to the backend, since I am just logging out
      state.isAuthenticated = false;
    },
  },
});

//these are used with useDispatch()
export const { loginSuccess, logout } = authSlice.actions;

//and these are stored in store.js under the name "authReducer"
export default authSlice.reducer;
