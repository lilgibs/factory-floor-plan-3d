import useFloorPlanViewModel from '../../floor-plan/_useFloorPlanViewModel'
import CanvasArea from '../../floor-plan/_components/CanvasArea'

export default function FloorPlanEmbed() {
  const model = useFloorPlanViewModel()

  return (
    <div className='h-[480px] w-[640px] bg-white'>
      <div className='relative w-full h-full' ref={model.fullScreenRef}>
        <CanvasArea model={model} />
      </div>
    </div>
  )
}
