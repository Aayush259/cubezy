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
        },
        updateConnections: (state, action) => {
            const connections = action.payload;
            const updatedUser = { ...state.user, connections } as IUserSlice["user"];
            state.user = updatedUser;
        },
        updateUser: (state, action) => {
            const updatedUser = action.payload;
            state.user = updatedUser;
        }
    }
});

export const { login, logout, updateConnections, updateUser } = userSlice.actions;
export default userSlice.reducer;
