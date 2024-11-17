import { createSlice } from "@reduxjs/toolkit";
import { IUserSlice } from "../interfaces/interfaces";

const initialState: IUserSlice = {
    isLoggedIn: false,
    user: null,
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        login: (state, action) => {
            state.isLoggedIn = true;
            state.user = action.payload;
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.user = null;
        }
    }
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
