"use client"

import type React from "react"
import { useState, useRef, type ReactNode } from "react"
import "./Tooltip.css"

interface TooltipProps {
  children: ReactNode
  content: ReactNode
  position?: "top" | "bottom" | "left" | "right"
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, position = "top" }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  return (
    <div className="tooltip-container" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <div className={`tooltip tooltip-${position}`} ref={tooltipRef}>
          {content}
        </div>
      )}
    </div>
  )
}

export default Tooltip

