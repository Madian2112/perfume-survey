"use client"

import type React from "react"
import type { ReactNode, ChangeEvent } from "react"
import "./Input.css"

interface InputProps {
  type?: string
  placeholder?: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  className?: string
  icon?: ReactNode
  autoFocus?: boolean
}

const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  icon = null,
  autoFocus = false,
}) => {
  return (
    <div className="input-container">
      {icon && <div className="input-icon">{icon}</div>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input ${icon ? "input-with-icon" : ""} ${className}`}
        autoFocus={autoFocus}
      />
    </div>
  )
}

export default Input

