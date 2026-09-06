import { Html } from '@react-three/drei';
import { Info } from 'lucide-react';
import React, { forwardRef } from 'react';
import type { MachineState } from '../domain/models/machine';

const STATE_STYLES: Record<MachineState, { label: string; button: string }> = {
  running: {
    label: 'bg-emerald-700 border-emerald-300',
    button: 'bg-emerald-500 hover:bg-emerald-400',
  },
  idle: {
    label: 'bg-amber-500 border-amber-200 text-neutral-950',
    button: 'bg-amber-500 hover:bg-amber-400 text-neutral-950',
  },
  stopped: {
    label: 'bg-red-700 border-red-300',
    button: 'bg-red-600 hover:bg-red-500',
  },
};

interface IProps {
  name: string;
  position: [number, number, number];
  state: MachineState;
  onFocusCamera?: (position: [number, number, number]) => void;
  setActiveTooltip: React.Dispatch<React.SetStateAction<string | null>>;
}

const Button3D = forwardRef<HTMLDivElement, IProps>(function Button3D(
  { name, position, state, setActiveTooltip, onFocusCamera },
  ref
) {
  const styles = STATE_STYLES[state];

  return (
    <Html
      className="flex flex-col gap-1 md:gap-2 items-center"
      key={name}
      position={position}
      center
      occlude
      zIndexRange={[0, 100]}
    >
      <div
        className={`h-[28px] md:h-[42px] w-[70px] md:w-[100px] flex items-center justify-center border text-[10px] md:text-base text-white font-semibold shadow-lg rounded-md ${styles.label}`}
        title={`${name}: ${state}`}
      >
        {name}
      </div>
      <div
        ref={ref} // ref di sini valid karena pakai forwardRef
        onClick={(e) => {
          e.stopPropagation();
          setActiveTooltip((prev) => (prev === name ? null : name));
          onFocusCamera?.(position);
        }}
        className={`p-1 text-white rounded-full shadow-lg cursor-pointer transition-colors ${styles.button}`}
        title={`Open ${name} (${state})`}
      >
        <Info />
      </div>
    </Html>
  );
});

export default Button3D;
