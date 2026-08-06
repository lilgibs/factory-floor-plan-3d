import { Html } from '@react-three/drei'
import { Info } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import MachineInfo3D from './MachineInfo3D'
import type { IMachineProps } from '../domain/models/machine'

interface Props {
  name: string
  position: [number, number, number],
  data: IMachineProps
  onFocusCamera?: (position: [number, number, number]) => void
}

export default function Machine3DWithTooltip({ name, position, data, onFocusCamera }: Props) {
  const [showTooltip, setShowTooltip] = useState(false)
  const groupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (groupRef.current && !groupRef.current.contains(event.target as Node)) {
        setShowTooltip(prev => !prev)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <Html position={position} center zIndexRange={[0, 100]}>
        <div ref={groupRef} className="flex flex-col items-center gap-2">
          <div className="h-[28px] md:h-[42px] w-[70px] md:w-[100px] flex items-center justify-center bg-neutral-900 text-[10px] md:text-base text-white shadow rounded-md">
            {name}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowTooltip(prev => !prev)
              onFocusCamera?.(position)
            }}
            className="p-1 bg-blue-500 text-white hover:bg-blue-600 rounded-full shadow cursor-pointer"
          >
            <Info />
          </button>

          {showTooltip && (
            <div className="translate-y-[-100%] z-[999]">
              <MachineInfo3D data={data} />
            </div>
          )}
        </div>
      </Html>
    </>
  )
}
