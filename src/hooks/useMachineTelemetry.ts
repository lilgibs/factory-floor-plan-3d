import { useEffect, useState } from 'react';
import type { IMachineProps } from '../domain/models/machine';

/**
 * A live-looking reading for one machine.
 *
 * The earlier version generated `Math.random()` inside the info panel and
 * showed the result for whichever machine was open, so every machine displayed
 * the same numbers changing in step. Clicking a different tag changed the title
 * and nothing else.
 *
 * Readings now drift around that machine's own baseline, which keeps each one
 * in character: the machine that scraps stays the one that scraps, and the
 * healthy machine does not randomly look like the worst on the floor for a
 * second. Drift is small on purpose. A shop-floor figure that swings across its
 * whole range every second is not a reading, it is decoration.
 */
const TICK_MS = 1500;
const DRIFT = 0.04;

function drift(base: number, spread = DRIFT): number {
  return base * (1 + (Math.random() * 2 - 1) * spread);
}

export function useMachineTelemetry(machine: IMachineProps): IMachineProps {
  const [reading, setReading] = useState<IMachineProps>(machine);

  useEffect(() => {
    // Snap back to the baseline whenever the selected machine changes, so the
    // panel never briefly shows the previous machine's drifted numbers.
    setReading(machine);

    // A stopped machine is not producing readings, and inventing movement for
    // it would be a lie the interface tells on the operator's behalf.
    if (machine.state === 'stopped') return undefined;

    const interval = setInterval(() => {
      setReading({
        ...machine,
        cycleTime: drift(machine.cycleTime),
        availability: Math.min(1, drift(machine.availability)),
        quality: Math.min(1, drift(machine.quality, DRIFT / 2)),
        unitsProduced: Math.round(drift(machine.unitsProduced, DRIFT / 4)),
        energyKwh: drift(machine.energyKwh, DRIFT / 2),
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [machine]);

  return reading;
}
