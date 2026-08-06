
import { LandPlot } from 'lucide-react'
import logo from '../assets/png/my_logo.png'
import useGlobalHooks from '../hooks/_useGlobalHooks'
import { useEffect, useRef } from 'react';

interface IProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export default function Sidebar({ isOpen, setIsOpen, menuButtonRef }: IProps) {
  const globalHooks = useGlobalHooks()
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const clickedTarget = event.target as Node
      const clickedOutsideSidebar = containerRef.current && !containerRef.current.contains(clickedTarget)
      const clickedOutsideNavbarButton = menuButtonRef.current && !menuButtonRef.current.contains(clickedTarget)

      if (window.innerWidth <= 1024 && clickedOutsideSidebar && clickedOutsideNavbarButton) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuButtonRef, setIsOpen])

  return (
    <div
      className={`z-999 fixed lg:sticky left-0 top-[72px] lg:top-0 ${isOpen ? ' w-full lg:w-[300px]' : 'hidden lg:block w-full lg:w-[72px]'} shadow lg:shadow-none lg:h-screen lg:flex flex-col transition-all duration-300 ease-in-out`}
      ref={containerRef}
    >
      <div
        onClick={() => globalHooks.navigate('/')}
        className='h-[72px] flex items-center justify-center gap-2 bg-white shadow-md border-b border-gray-300 cursor-pointer'
      >
        <img
          src={logo}
          alt="LIL GIBRAN Logo"
          width={42}
          height={42}
        />
        <p className={`${isOpen ? 'block' : 'hidden'} text-nowrap overflow-hidden font-bold text-2xl`}>LILGIBS</p>
      </div>
      <div className={`-z-10 flex-1 ${isOpen ? 'p-4' : 'py-4 px-2 lg:items-center'} flex flex-col gap-4 bg-white font-semibold transition-all duration-300 ease-in-out`}>
        <p>Menu</p>
        <div className='flex flex-col gap-4'>
          <button
            className={`p-2 flex gap-4 hover:bg-blue-50 ${window.location.pathname === '/floor-plan' ? 'bg-blue-50' : ''} rounded-md cursor-pointer`}
            onClick={() => {
              globalHooks.navigate('/floor-plan')
              if (window.innerWidth <= 1024) setIsOpen(false)
            }}
          >
            <LandPlot />
            <span className={`${isOpen ? 'block' : 'hidden'} text-nowrap overflow-hidden`}>Floor Plan</span>
          </button>
        </div>
      </div>
    </div >
  )
}
