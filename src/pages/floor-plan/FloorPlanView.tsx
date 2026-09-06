import useFloorPlanViewModel from './_useFloorPlanViewModel';
import CanvasArea from './_components/CanvasArea';

export default function FloorPlanView() {
  const model = useFloorPlanViewModel();

  return (
    <div className='p-4 md:p-6 flex flex-col gap-4 min-h-[calc(100dvh-72px-32px)] md:min-h-[calc(100dvh-72px-48px)] bg-white rounded-lg shadow-md'>
      <h1 className='text-xl md:text-3xl font-bold'>Floor Plan</h1>
      <hr />
      <div className='p-2 md:p-4 flex-1 grid grid-cols-1 border border-gray-300 rounded-lg'>
        {!model.isExpanded && (
          <div className='relative' ref={model.fullScreenRef} id='CanvasWrapper'>
            <CanvasArea model={model} />
          </div>
        )}
        {model.isExpanded && (
          <div className='fixed inset-0 bg-white z-[9999]'>
            <div className='relative w-full h-full' ref={model.fullScreenRef}>
              <CanvasArea model={model} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
