import { useState } from 'react';
import type { IMachineProps } from '../domain/models/machine';
import { useMachineTelemetry } from '../hooks/useMachineTelemetry';
import { firstTimeYieldOf, healthOf, oeeOf, scrapRateOf, type MachineHealth } from '../domain/oee';
import { duration, kwh, percent, seconds, units } from '../lib/format';

const HEALTH_LABEL: Record<MachineHealth, string> = {
  good: 'On target',
  warning: 'Below target',
  critical: 'Needs attention',
  offline: 'Stopped',
};

const HEALTH_DOT: Record<MachineHealth, string> = {
  good: 'bg-emerald-400',
  warning: 'bg-amber-400',
  critical: 'bg-red-500',
  offline: 'bg-neutral-500',
};

/**
 * OEE is coloured against the thresholds, the rest is not.
 *
 * Colouring every tile would leave nothing standing out. OEE is the figure a
 * supervisor acts on, so it is the only one allowed to shout.
 */
const OEE_TEXT: Record<MachineHealth, string> = {
  good: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-red-400',
  offline: 'text-neutral-400',
};

function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-md md:rounded-lg overflow-hidden text-center">
      <div className="text-[10px] md:text-xs bg-black text-white px-2 md:px-4 py-1 md:py-2 truncate">
        {label}
      </div>
      <div
        className={`text-[10px] md:text-base font-semibold bg-neutral-700 py-1 md:py-2 ${tone ?? 'text-white'}`}
      >
        {value}
      </div>
    </div>
  );
}

export default function MachineInfo3D({ data }: { data: IMachineProps }) {
  const [onDetails, setOnDetails] = useState(false);

  // Readings drift around this machine's own baseline. The panel used to show
  // one shared stream of random numbers, so every machine read the same.
  const live = useMachineTelemetry(data);
  const { oee, availability, performance, quality } = oeeOf(live);
  const health = healthOf(live);

  return (
    <div className="p-2 md:p-4 flex flex-col gap-2 md:gap-4 w-[300px] md:w-[500px] bg-black/75 rounded-md md:rounded-lg">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs md:text-base text-white font-semibold">{data.name}</p>
        <p className="flex items-center gap-1.5 text-[10px] md:text-xs text-white/80">
          <span className={`inline-block h-2 w-2 rounded-full ${HEALTH_DOT[health]}`} />
          {HEALTH_LABEL[health]}
        </p>
      </div>

      <div className="w-full grid grid-cols-4 gap-1 md:gap-2">
        <Metric label="OEE" value={percent(oee)} tone={OEE_TEXT[health]} />
        <Metric label="Cycle Time" value={seconds(live.cycleTime)} />
        <Metric label="First Time Yield" value={units(firstTimeYieldOf(live))} />
        <Metric label="Scrap" value={percent(scrapRateOf(live), 1)} />
      </div>

      {onDetails && (
        <>
          {/* The three parts of OEE, because the headline figure alone cannot
              say whether the machine is stopping, running slow, or scrapping. */}
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            <Metric label="Availability" value={percent(availability)} />
            <Metric label="Performance" value={percent(performance)} />
            <Metric label="Quality" value={percent(quality)} />
          </div>
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            <Metric label="Downtime" value={duration(live.downtimeMinutes)} />
            <Metric label="Changeover" value={duration(live.changeoverMinutes)} />
            <Metric label="Energy" value={kwh(live.energyKwh)} />
          </div>
        </>
      )}

      <button
        type="button"
        className="flex items-center justify-center font-semibold text-white text-[10px] md:text-sm underline cursor-pointer"
        onClick={() => setOnDetails(!onDetails)}
        aria-expanded={onDetails}
      >
        {onDetails ? 'Hide Details' : 'Show Details'}
      </button>
    </div>
  );
}
