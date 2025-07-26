import userSlice from "./features/userSlice"
import { configureStore } from "@reduxjs/toolkit"

const store = configureStore({
    reducer: {
        user: userSlice
    }
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export default store
