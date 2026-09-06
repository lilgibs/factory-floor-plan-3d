import { Html } from '@react-three/drei'
import React, { useEffect, useRef, type RefObject } from 'react'

interface IProps {
  name: string
  position: [number, number, number],
  isOpen: boolean
  children: React.ReactNode
  setActiveTooltip: React.Dispatch<React.SetStateAction<string | null>>
  anchorRef: RefObject<HTMLDivElement | null>
}

const TRANSITION_MS = 240

export default function Tooltip3D({ name, position, isOpen, setActiveTooltip, children, anchorRef }: IProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = React.useState(isOpen)
  const [isVisible, setIsVisible] = React.useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      return undefined
    }

    setIsVisible(false)
    const timeout = window.setTimeout(() => setShouldRender(false), TRANSITION_MS)

    return () => window.clearTimeout(timeout)
  }, [isOpen])

  useEffect(() => {
    if (!shouldRender || !isOpen) return undefined

    const frame = window.requestAnimationFrame(() => setIsVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [isOpen, shouldRender])

  useEffect(() => {
    if (!isOpen) return undefined

    let startTime = 0
    let startX = 0
    let startY = 0

    function handleMouseDown(event: MouseEvent) {
      const target = event.target as Node
      const inTooltip = containerRef.current?.contains(target)
      const inButton = anchorRef.current?.contains(target)

      if (!inTooltip && !inButton) {
        startTime = Date.now()
        startX = event.clientX
        startY = event.clientY
      }
    }

    function handleMouseUp(event: MouseEvent) {
      const target = event.target as Node
      const inTooltip = containerRef.current?.contains(target)
      const inButton = anchorRef.current?.contains(target)

      const timeHeld = Date.now() - startTime
      const deltaX = Math.abs(event.clientX - startX)
      const deltaY = Math.abs(event.clientY - startY)
      const movedTooFar = deltaX > 5 || deltaY > 5
      const heldTooLong = timeHeld > 300

      if (!inTooltip && !inButton && !movedTooFar && !heldTooLong) {
        setActiveTooltip(null)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [anchorRef, isOpen, setActiveTooltip])

  if (!shouldRender) return null

  return (
    <Html
      className='translate-x-[-50%] translate-y-[-100%]'
      position={position}
      zIndexRange={[0, 100]}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-label={`${name} machine details`}
        className={`origin-bottom transition-[opacity,transform] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none ${
          isVisible
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-2 scale-95 opacity-0'
        }`}
      >
        {children}
      </div>
    </Html>
  )
}
