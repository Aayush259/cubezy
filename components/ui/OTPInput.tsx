"use client"
import { useEffect, useRef, useState } from "react"

interface OTPInputProps {
    length: number
    onOtpSubmit: (otp: string) => void
    disabled?: boolean
}

const OTPInput: React.FC<OTPInputProps> = ({ length, onOtpSubmit, disabled }) => {
    const [otp, setOtp] = useState(new Array(length).fill(""))
    const inputRefs = useRef<Array<HTMLInputElement | null>>([])

    const handleOtpChange = (idx: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        const newOtp = [...otp]

        // Allow only one input
        newOtp[idx] = value.substring(value.length - 1)
        setOtp(newOtp)
        const combinedOtp = newOtp.join("")

        // Submit OTP trigger
        if (combinedOtp.length === length) {
            onOtpSubmit(combinedOtp)
        }

        if (value.trim() && idx < length - 1 && inputRefs.current[idx + 1]) {
            inputRefs.current[idx + 1]?.focus()
        }
    }

    const handleClick = (idx: number) => {
        const clickedInputRef = inputRefs.current[idx]
        if (clickedInputRef) {
            clickedInputRef.setSelectionRange(1, 1)
        }
    }

    const handleKeyDown = (idx: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        // Move focus to the previous input field on backspace
        if (event.key === "Backspace" && !otp[idx] && idx > 0) {
            const prevInput = inputRefs.current[idx - 1]
            if (prevInput) {
                prevInput.focus()
            }
        }
    }

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [])

    return (
        <div>
            {otp.map((value, idx) => <input
                key={idx}
                type="text"
                ref={input => { inputRefs.current[idx] = input }}
                value={value}
                onChange={(e) => handleOtpChange(idx, e)}
                onClick={() => handleClick(idx)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                readOnly={disabled}
                className="w-[40px] h-[40px] m-1.5 bg-transparent border border-white/80 rounded-lg text-center"
            />)}
        </div>
    )
}

export default OTPInput