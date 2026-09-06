import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import type useFloorPlanViewModel from "../_useFloorPlanViewModel";
import { Html, OrbitControls } from "@react-three/drei";
import { Expand, LoaderCircle, Minimize, Minus, Plus } from "lucide-react";
import { FactoryModel } from "../../../components/FactoryModel";
import Button3D from "../../../components/Button3D";
import Tooltip3D from "../../../components/Tooltip3D";
import MachineInfo3D from "../../../components/MachineInfo3D";
import MachineSearch from "./MachineSearch";

export default function CanvasArea({ model }: { model: ReturnType<typeof useFloorPlanViewModel> }) {
  return (
    <>
      {model.onReset &&
        <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center font-semibold text-2xl bg-white z-10'>Resizing...</div>}
      {!model.onReset &&
        <Canvas
          camera={{ position: [10, 10, 10], fov: 50 }}
          style={{ background: '#E0E0E0' }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 7]} intensity={0.6} />
          <Suspense
            fallback={
              <Html center>
                <div className='animate-spin text-blue-500'>
                  <LoaderCircle size={48} />
                </div>
              </Html>
            }
          >
            <FactoryModel />
            {/* Render tombol 3D */}
            {model.data.map((val) => (
              <Button3D
                key={`button-${val.name}`}
                name={val.name}
                position={val.position}
                state={val.state}
                setActiveTooltip={model.setActiveTooltip}
                onFocusCamera={model.focusCameraTo}
                ref={model.button3dRefs.current[val.name]}
              />
            ))}

            {/* Keep tooltip shells mounted so the close transition can finish. */}
            {model.data.map((val) => (
              <Tooltip3D
                key={`tooltip-${val.name}`}
                name={val.name}
                position={val.position}
                isOpen={model.activeTooltip === val.name}
                setActiveTooltip={model.setActiveTooltip}
                anchorRef={model.button3dRefs.current[val.name]}
              >
                <MachineInfo3D data={val} />
              </Tooltip3D>
            ))}
          </Suspense>
          <OrbitControls enableDamping ref={model.canvasControlsRef} />
        </Canvas>
      }
      <div className="absolute top-4 right-4 flex flex-col items-end gap-3 z-50">
        {/* Desktop - Start*/}
        <button
          onClick={model.handleToggleFullscreen}
          className="relative hidden md:block h-[24px] w-[24px] bg-blue-500 hover:bg-blue-600 text-white rounded shadow cursor-pointer"
        >
          {model.isFullscreen ?
            <Minimize size={16} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
            :
            <Expand size={16} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
          }
        </button>
        {/* Desktop - END*/}

        {/* Mobile - Start*/}
        <button
          onClick={model.handleToggleExpandMobile}
          className="relative md:hidden h-[24px] w-[24px] bg-blue-500 hover:bg-blue-600 text-white rounded shadow cursor-pointer"
        >
          {model.isExpanded ?
            <Minimize size={16} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
            :
            <Expand size={16} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
          }
        </button>
        {/* Mobile - END*/}

        <MachineSearch model={model} />

        <div className='flex flex-col items-end gap-2'>
          <button
            onClick={model.handleZoomIn}
            className="relative  h-[24px] w-[24px] bg-blue-500 hover:bg-blue-600 text-white rounded shadow cursor-pointer"
          >
            <Plus size={16} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
          </button>
          <button
            onClick={model.handleZoomOut}
            className="relative h-[24px] w-[24px] bg-blue-500 hover:bg-blue-600 text-white rounded shadow cursor-pointer"
          >
            <Minus size={16} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
          </button>
        </div>
      </div>
      <div className='hidden absolute md:flex flex-col gap-4 bottom-4 left-4 text-sm italic'>
        <p>Mouse Controls</p>
        <div>
          <p>Left Click + Drag (Hold) - Rotate</p>
          <p>Right Click + Drag (Hold) - Move</p>
          <p>Middle Mouse Scroll / Hold + Drag - Zoom</p>
        </div>
      </div>
      <div className='absolute flex flex-col gap-2 md:hidden bottom-4 left-4 text-[10px] italic'>
        <p>Mobile Touch Controls</p>
        <div>
          <p>Drag with one finger - Rotate</p>
          <p>Drag with two fingers - Move</p>
          <p>Pinch - Zoom</p>
        </div>
      </div>
    </>
  );
}

