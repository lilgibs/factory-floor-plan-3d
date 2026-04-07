
import logo from '../assets/png/my_logo.png'

export default function Footer() {

  return (
    <div className={`h-[72px] pb-4 flex items-center justify-center`}>
      <div className='flex items-center justify-center gap-2'>
        <p>Powered by</p>
        <img
          src={logo}
          alt="LIL GIBRAN Logo"
          width={42}
          height={42}
        />
        <p className='font-bold text-2xl'>LILGIBS</p>
      </div>
    </div>
  )
}
