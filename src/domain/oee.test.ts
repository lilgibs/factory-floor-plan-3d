import { describe, it, expect } from 'vitest';
import {
  oeeOf,
  performanceOf,
  healthOf,
  scrapRateOf,
  firstTimeYieldOf,
  summarizeFloor,
  OEE_WORLD_CLASS,
} from './oee';
import type { IMachineProps } from './models/machine';

const machine = (overrides: Partial<IMachineProps> = {}): IMachineProps => ({
  name: 'Tag 0000',
  position: [0, 0, 0],
  cycleTime: 12,
  idealCycleTime: 12,
  availability: 1,
  quality: 1,
  unitsProduced: 100,
  downtimeMinutes: 0,
  changeoverMinutes: 0,
  energyKwh: 100,
  state: 'running',
  ...overrides,
});

describe('performanceOf', () => {
  it('is full marks when the machine hits its rated speed', () => {
    expect(performanceOf(machine({ cycleTime: 12, idealCycleTime: 12 }))).toBe(1);
  });

  it('falls off as the actual cycle time grows', () => {
    expect(performanceOf(machine({ cycleTime: 24, idealCycleTime: 12 }))).toBe(0.5);
  });

  // Running above rated speed means the rating or the measurement is wrong, and
  // letting it inflate OEE would hide that behind a flattering number.
  it('never exceeds full marks when running faster than rated', () => {
    expect(performanceOf(machine({ cycleTime: 6, idealCycleTime: 12 }))).toBe(1);
  });

  it('reports nothing rather than dividing by zero', () => {
    expect(performanceOf(machine({ cycleTime: 0 }))).toBe(0);
  });
});

describe('oeeOf', () => {
  it('multiplies the three ratios together', () => {
    const result = oeeOf(machine({ availability: 0.9, cycleTime: 15, idealCycleTime: 12, quality: 0.8 }));
    expect(result.performance).toBeCloseTo(0.8);
    expect(result.oee).toBeCloseTo(0.9 * 0.8 * 0.8);
  });

  // The product alone cannot say what to fix, which is the whole reason the
  // parts are kept rather than a single stored figure.
  it('keeps the three parts so the cause stays visible', () => {
    const stopping = oeeOf(machine({ availability: 0.6 }));
    const scrapping = oeeOf(machine({ quality: 0.6 }));
    expect(stopping.oee).toBeCloseTo(scrapping.oee);
    expect(stopping.availability).not.toBeCloseTo(scrapping.availability);
  });

  it('clamps nonsense inputs instead of propagating them', () => {
    expect(oeeOf(machine({ availability: 1.4, quality: -0.2 })).oee).toBe(0);
  });
});

describe('healthOf', () => {
  it('calls a machine good at or above world class', () => {
    expect(healthOf(machine({ availability: OEE_WORLD_CLASS }))).toBe('good');
  });

  it('warns between the acceptable line and world class', () => {
    expect(healthOf(machine({ availability: 0.7 }))).toBe('warning');
  });

  it('flags anything below the acceptable line as critical', () => {
    expect(healthOf(machine({ availability: 0.4 }))).toBe('critical');
  });

  // A planned stop is not a fault. Flagging it as one is how alerting turns
  // into noise people learn to ignore.
  it('reports a stopped machine as offline, not critical', () => {
    expect(healthOf(machine({ state: 'stopped', availability: 0 }))).toBe('offline');
  });
});

describe('scrap and yield', () => {
  it('derives scrap from quality', () => {
    expect(scrapRateOf(machine({ quality: 0.88 }))).toBeCloseTo(0.12);
  });

  it('counts only the units that passed first time', () => {
    expect(firstTimeYieldOf(machine({ unitsProduced: 400, quality: 0.9 }))).toBe(360);
  });
});

describe('summarizeFloor', () => {
  const floor = [
    machine({ name: 'A', availability: 1, quality: 1 }),
    machine({ name: 'B', availability: 0.5, quality: 1 }),
    machine({ name: 'C', state: 'stopped', availability: 0, quality: 0 }),
  ];

  // Counting a planned stop as a zero would let one changeover drag a healthy
  // shift's figure down and make the floor look like it is failing.
  it('leaves stopped machines out of the average', () => {
    expect(summarizeFloor(floor).averageOee).toBeCloseTo(0.75);
  });

  it('counts stopped machines separately', () => {
    expect(summarizeFloor(floor).offline).toBe(1);
  });

  it('names the machine dragging the floor down', () => {
    expect(summarizeFloor(floor).worst?.name).toBe('B');
  });

  it('counts how many are below the acceptable line', () => {
    expect(summarizeFloor(floor).needsAttention).toBe(1);
  });

  it('totals downtime and energy across every machine, stopped included', () => {
    const summary = summarizeFloor([
      machine({ downtimeMinutes: 10, energyKwh: 100 }),
      machine({ state: 'stopped', downtimeMinutes: 5, energyKwh: 20 }),
    ]);
    expect(summary.totalDowntimeMinutes).toBe(15);
    expect(summary.totalEnergyKwh).toBe(120);
  });

  it('reports zero rather than dividing by nothing on an all-stopped floor', () => {
    const summary = summarizeFloor([machine({ state: 'stopped' })]);
    expect(summary.averageOee).toBe(0);
    expect(summary.worst).toBeNull();
  });
});
