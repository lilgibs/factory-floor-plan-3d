import type { IMachineProps } from '../domain/models/machine';

/**
 * The demo floor.
 *
 * The six machines are deliberately in different conditions, because a floor
 * where every reading matches tells the viewer nothing. Each one here fails in
 * a different way, which is the point of splitting OEE into three parts: the
 * headline number can be similar while the cause is not.
 *
 *   1001  healthy, above world class
 *   1002  fine on paper, quietly losing units to scrap
 *   1003  fast and accurate, but stopping constantly
 *   1004  available and accurate, running well under rated speed
 *   1005  the worst on the floor, failing on all three counts
 *   1006  stopped for a planned changeover, so it has no OEE at all
 */
export const machines: IMachineProps[] = [
  {
    name: 'Tag 1001',
    position: [-0.6, 4, 0.2],
    cycleTime: 12.4,
    idealCycleTime: 12.0,
    availability: 0.94,
    quality: 0.99,
    unitsProduced: 412,
    downtimeMinutes: 18,
    changeoverMinutes: 6,
    energyKwh: 1234.7,
    state: 'running',
  },
  {
    name: 'Tag 1002',
    position: [0.04, 4, 3.1],
    cycleTime: 13.1,
    idealCycleTime: 12.0,
    availability: 0.91,
    // Nothing looks wrong on the floor, but almost one unit in eight is scrap.
    quality: 0.87,
    unitsProduced: 388,
    downtimeMinutes: 27,
    changeoverMinutes: 9,
    energyKwh: 1187.2,
    state: 'running',
  },
  {
    name: 'Tag 1003',
    position: [2.9, 4, 3.9],
    cycleTime: 12.1,
    idealCycleTime: 12.0,
    // Runs beautifully when it runs. It just keeps stopping.
    availability: 0.62,
    quality: 0.98,
    unitsProduced: 264,
    downtimeMinutes: 148,
    changeoverMinutes: 12,
    energyKwh: 902.4,
    state: 'running',
  },
  {
    name: 'Tag 1004',
    position: [-3.4, 4, 2.6],
    // Available and accurate, but running at two thirds of its rated speed.
    cycleTime: 18.6,
    idealCycleTime: 12.0,
    availability: 0.96,
    quality: 0.97,
    unitsProduced: 301,
    downtimeMinutes: 14,
    changeoverMinutes: 7,
    energyKwh: 1402.9,
    state: 'running',
  },
  {
    name: 'Tag 1005',
    position: [1.8, 4, -2.4],
    // Slow, stopping, and scrapping. The one to look at first.
    cycleTime: 19.8,
    idealCycleTime: 12.0,
    availability: 0.71,
    quality: 0.83,
    unitsProduced: 176,
    downtimeMinutes: 96,
    changeoverMinutes: 21,
    energyKwh: 1521.3,
    state: 'running',
  },
  {
    name: 'Tag 1006',
    position: [-2.2, 4, -1.1],
    cycleTime: 12.0,
    idealCycleTime: 12.0,
    availability: 0,
    quality: 0,
    unitsProduced: 0,
    downtimeMinutes: 0,
    changeoverMinutes: 45,
    energyKwh: 88.5,
    // A planned changeover, not a fault. Reported as offline rather than
    // critical so a scheduled stop does not read as an alarm.
    state: 'stopped',
  },
];
