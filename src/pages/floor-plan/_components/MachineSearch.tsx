import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { MachineState } from '../../../domain/models/machine';
import type useFloorPlanViewModel from '../_useFloorPlanViewModel';

const STATUS_STYLES: Record<MachineState, string> = {
  running: 'bg-emerald-400 shadow-emerald-400/70',
  idle: 'bg-amber-400 shadow-amber-400/70',
  stopped: 'bg-red-500 shadow-red-500/70',
};

export default function MachineSearch({
  model,
}: {
  model: ReturnType<typeof useFloorPlanViewModel>;
}) {
  const [query, setQuery] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) return model.data;

    return model.data.filter(
      (machine) =>
        machine.name.toLowerCase().includes(searchTerm) ||
        machine.state.toLowerCase().includes(searchTerm)
    );
  }, [model.data, query]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsPanelOpen(false);
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isPanelOpen) return undefined;

    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isPanelOpen]);

  const selectMachine = (machine: (typeof model.data)[number]) => {
    setQuery(machine.name);
    setIsPanelOpen(false);
    setIsOpen(false);
    model.setActiveTooltip(machine.name);
    model.focusCameraTo(machine.position);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((current) => Math.min(current + 1, results.length - 1));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === 'Enter' && isOpen && results[highlightedIndex]) {
      event.preventDefault();
      selectMachine(results[highlightedIndex]);
    }

    if (event.key === 'Escape') {
      setIsPanelOpen(false);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative z-10 h-[24px] w-[24px]">
      <button
        type="button"
        aria-label="Search machine"
        aria-expanded={isPanelOpen}
        aria-controls="machine-search-panel"
        title="Search machine"
        onClick={() => {
          const nextOpen = !isPanelOpen;
          setIsPanelOpen(nextOpen);
          setIsOpen(nextOpen);
        }}
        className="relative h-[24px] w-[24px] bg-blue-500 hover:bg-blue-600 text-white rounded shadow cursor-pointer"
      >
        <Search
          aria-hidden="true"
          size={16}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </button>

      <div
        id="machine-search-panel"
        aria-hidden={!isPanelOpen}
        className={`absolute right-8 top-0 w-44 max-w-[calc(100vw-4rem)] origin-top-right transition-[opacity,transform] duration-200 md:w-52 ${
          isPanelOpen
            ? 'pointer-events-auto translate-x-0 scale-100 opacity-100'
            : 'pointer-events-none translate-x-2 scale-[0.98] opacity-0'
        }`}
      >
      <div className="relative overflow-hidden rounded-lg border border-white/20 bg-neutral-950/85 shadow-xl backdrop-blur-md transition-colors focus-within:border-blue-400">
        <Search
          aria-hidden="true"
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/55"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-label="Search machine"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="machine-search-results"
          aria-activedescendant={
            isOpen && highlightedIndex >= 0 && results[highlightedIndex]
              ? `machine-option-${highlightedIndex}`
              : undefined
          }
          tabIndex={isPanelOpen ? 0 : -1}
          placeholder="Search machine..."
          className="h-8 w-full bg-transparent pl-9 pr-9 text-[11px] text-white outline-none placeholder:text-white/45 md:h-9 md:text-xs [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear machine search"
            tabIndex={isPanelOpen ? 0 : -1}
            onClick={() => {
              setQuery('');
              setIsOpen(true);
              model.setActiveTooltip(null);
            }}
            className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div
        id="machine-search-results"
        role="listbox"
        aria-hidden={!isOpen}
        className={`absolute right-0 top-full mt-1 max-h-40 w-full origin-top-right overflow-y-auto rounded-lg border border-white/15 bg-neutral-950/95 p-1 shadow-2xl backdrop-blur-md transition-[opacity,transform] duration-200 ${
          isOpen
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-[0.98] opacity-0'
        }`}
      >
        {results.length > 0 ? (
          results.map((machine, index) => {
            const isActive = model.activeTooltip === machine.name;
            const isHighlighted = highlightedIndex === index;

            return (
              <button
                key={machine.name}
                id={`machine-option-${index}`}
                type="button"
                role="option"
                aria-selected={isActive}
                tabIndex={isOpen ? 0 : -1}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectMachine(machine)}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                  isHighlighted || isActive ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 shrink-0 rounded-full shadow-[0_0_8px] ${STATUS_STYLES[machine.state]}`}
                  />
                  <span className="truncate text-[10px] font-semibold text-white md:text-xs">
                    {machine.name}
                  </span>
                </span>
                <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/45">
                  {machine.state}
                </span>
              </button>
            );
          })
        ) : (
          <p className="px-3 py-3 text-center text-[10px] text-white/50">No machine found</p>
        )}
      </div>
      </div>
    </div>
  );
}
