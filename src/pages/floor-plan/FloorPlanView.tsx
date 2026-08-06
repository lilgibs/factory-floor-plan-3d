import Select from 'react-select';
import useFloorPlanViewModel from './_useFloorPlanViewModel';
import CanvasArea from './_components/CanvasArea';
import { healthOf, oeeOf } from '../../domain/oee';
import { percent } from '../../lib/format';

interface MachineOption {
  value: string;
  label: string;
  position: [number, number, number];
}

export default function FloorPlanView() {
  const model = useFloorPlanViewModel();

  /**
   * The picker used to be rendered with `options={[]}`, so it opened onto
   * nothing. It now lists the machines with their current OEE, which is the
   * fastest way to reach the one that needs looking at on a floor too large to
   * scan by eye.
   */
  const options: MachineOption[] = model.data.map((machine) => ({
    value: machine.name,
    label: `${machine.name} · ${healthOf(machine) === 'offline' ? 'stopped' : percent(oeeOf(machine).oee)}`,
    position: machine.position,
  }));

  const handleSelect = (option: MachineOption | null) => {
    if (!option) {
      model.setActiveTooltip(null);
      return;
    }
    model.setActiveTooltip(option.value);
    model.focusCameraTo(option.position);
  };

  return (
    <div className='p-4 md:p-6 flex flex-col gap-4 min-h-[calc(100dvh-72px-32px)] md:min-h-[calc(100dvh-72px-48px)] bg-white rounded-lg shadow-md'>
      <div className='flex flex-row items-center justify-between gap-4'>
        <h1 className='text-xl md:text-3xl font-bold'>Floor Plan</h1>
        <Select<MachineOption>
          className='min-w-[180px] md:min-w-[280px]'
          classNamePrefix='machine-select'
          isClearable
          isSearchable
          name='machine'
          inputId='machine-search'
          aria-label='Find a machine and move the camera to it'
          placeholder='Find a machine'
          options={options}
          value={options.find((option) => option.value === model.activeTooltip) ?? null}
          onChange={handleSelect}
        />
      </div>
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
