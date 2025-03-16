"use client"

import type React from "react"
import type { ReactNode } from "react"
import "./Card.css"

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  return (
    <div className={`card ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

export default Card

