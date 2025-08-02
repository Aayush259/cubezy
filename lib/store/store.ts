import userSlice from "./features/userSlice"
import authSlice from "./features/authSlice"
import { configureStore } from "@reduxjs/toolkit"

const store = configureStore({
    reducer: {
        user: userSlice,
        auth: authSlice
    }
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export default store