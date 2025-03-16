"use client"

import type React from "react"
import type { ReactNode } from "react"
import "./Button.css"

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "outline" | "ghost"
  size?: "small" | "medium" | "large"
  disabled?: boolean
  className?: string
  icon?: ReactNode
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  className = "",
  icon = null,
}) => {
  const buttonClasses = `button button-${variant} button-${size} ${className} ${disabled ? "button-disabled" : ""}`

  return (
    <button className={buttonClasses} onClick={onClick} disabled={disabled}>
      {icon && <span className="button-icon">{icon}</span>}
      {children}
    </button>
  )
}

export default Button

