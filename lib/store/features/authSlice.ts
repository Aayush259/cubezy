import { IAuthSlice } from "@/lib/interfaces"
import { createSlice } from "@reduxjs/toolkit"

const initialState: IAuthSlice = {
    email: "",
    password: "",
    name: undefined
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setEmail: (state, action) => {
            state.email = action.payload
        },
        setPassword: (state, action) => {
            state.password = action.payload
        },
        setName: (state, action) => {
            state.name = action.payload
        }
    }
})

export const { setEmail, setName, setPassword } = authSlice.actions
export default authSlice.reducer