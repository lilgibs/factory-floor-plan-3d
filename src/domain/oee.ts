import type { IMachineProps } from './models/machine';

/**
 * Overall Equipment Effectiveness.
 *
 * OEE is not a number a machine reports. It is the product of three separate
 * ratios, and the reason it is worth computing rather than storing is that the
 * product alone cannot tell you what to fix. Two machines can both sit at 60%
 * while one is stopping constantly and the other is producing scrap, and the
 * repair is completely different.
 *
 *   availability  share of scheduled time the machine could run
 *   performance   actual speed against the speed it was designed for
 *   quality       share of units that passed first time
 */
export interface OeeBreakdown {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
}

/**
 * Performance is the ideal cycle time over the actual one.
 *
 * Capped at 1 because a machine running faster than its rated speed is not
 * 110% effective, it is miscalibrated or mismeasured, and letting that inflate
 * OEE would hide the problem behind a flattering number.
 */
export function performanceOf(machine: IMachineProps): number {
  if (machine.cycleTime <= 0) return 0;
  return Math.min(1, machine.idealCycleTime / machine.cycleTime);
}

export function oeeOf(machine: IMachineProps): OeeBreakdown {
  const availability = clamp01(machine.availability);
  const performance = performanceOf(machine);
  const quality = clamp01(machine.quality);

  return {
    availability,
    performance,
    quality,
    oee: availability * performance * quality,
  };
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * The thresholds manufacturing actually uses.
 *
 * 85% is the figure widely treated as world class, and 60% is roughly where a
 * line is considered to have a real problem rather than a bad shift. They are
 * named here so the same numbers are not retyped into a colour condition
 * somewhere in a component.
 */
export const OEE_WORLD_CLASS = 0.85;
export const OEE_ACCEPTABLE = 0.6;

export type MachineHealth = 'good' | 'warning' | 'critical' | 'offline';

/**
 * How the machine is doing, which is separate from what it was told to do.
 *
 * A stopped machine is reported as offline rather than critical: its OEE is
 * zero by definition, and flagging a planned stop as a fault is how alerting
 * becomes noise that people learn to ignore.
 */
export function healthOf(machine: IMachineProps): MachineHealth {
  if (machine.state === 'stopped') return 'offline';
  const { oee } = oeeOf(machine);
  if (oee >= OEE_WORLD_CLASS) return 'good';
  if (oee >= OEE_ACCEPTABLE) return 'warning';
  return 'critical';
}

/** Scrap is the share that did not pass first time. */
export function scrapRateOf(machine: IMachineProps): number {
  return 1 - clamp01(machine.quality);
}

/** Units that passed first time, which is what actually shipped. */
export function firstTimeYieldOf(machine: IMachineProps): number {
  return Math.round(machine.unitsProduced * clamp01(machine.quality));
}

export interface FloorSummary {
  machineCount: number;
  /** Averaged across machines that are not stopped. */
  averageOee: number;
  needsAttention: number;
  offline: number;
  totalDowntimeMinutes: number;
  totalEnergyKwh: number;
  /** The machine dragging the floor down, or null when every machine is stopped. */
  worst: IMachineProps | null;
}

/**
 * The floor at a glance.
 *
 * Stopped machines are left out of the average rather than counted as zero.
 * Including them would let one planned stop drag the whole floor's figure down
 * and make a healthy shift look like a failing one.
 */
export function summarizeFloor(machines: readonly IMachineProps[]): FloorSummary {
  const active = machines.filter((machine) => machine.state !== 'stopped');

  let worst: IMachineProps | null = null;
  let worstOee = Infinity;
  let oeeTotal = 0;

  for (const machine of active) {
    const { oee } = oeeOf(machine);
    oeeTotal += oee;
    if (oee < worstOee) {
      worstOee = oee;
      worst = machine;
    }
  }

  return {
    machineCount: machines.length,
    averageOee: active.length > 0 ? oeeTotal / active.length : 0,
    needsAttention: active.filter((machine) => oeeOf(machine).oee < OEE_ACCEPTABLE).length,
    offline: machines.length - active.length,
    totalDowntimeMinutes: machines.reduce((total, m) => total + m.downtimeMinutes, 0),
    totalEnergyKwh: machines.reduce((total, m) => total + m.energyKwh, 0),
    worst,
  };
}
