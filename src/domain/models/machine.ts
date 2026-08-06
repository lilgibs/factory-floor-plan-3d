/**
 * A machine on the floor.
 *
 * Every metric is a number in a stated unit, never a preformatted string.
 * The earlier shape stored values like "66,37%" and "12,20s", which meant
 * nothing could be compared, sorted, or thresholded: the moment a reading
 * became text, the questions this app exists to answer ("which machine is
 * worst?", "is anything below target?") could no longer be asked of it.
 * Formatting belongs to the view, not the data.
 */
export interface IMachineProps {
  name: string;
  /** Where the marker sits in the 3D scene. */
  position: [number, number, number];

  /** Seconds to produce one unit. */
  cycleTime: number;
  /** Seconds the machine is designed to take. Performance is measured against it. */
  idealCycleTime: number;

  /** Share of scheduled time the machine was available to run, 0 to 1. */
  availability: number;
  /** Share of produced units that passed first time, 0 to 1. */
  quality: number;

  /** Units produced this shift. */
  unitsProduced: number;
  /** Minutes lost to unplanned stops this shift. */
  downtimeMinutes: number;
  /** Minutes lost to changeovers this shift. */
  changeoverMinutes: number;
  /** Kilowatt hours drawn this shift. */
  energyKwh: number;

  /**
   * What the operator set it to, which is not the same as how it is doing.
   * A machine can be Running and still be the worst performer on the floor,
   * so health is derived from the numbers rather than read from this field.
   */
  state: MachineState;
}

export type MachineState = 'running' | 'idle' | 'stopped';
