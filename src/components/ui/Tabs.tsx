import { useState } from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
  onChange?: (id: string) => void;
}

/**
 * Rounded pill-style tabs — used for zone selectors on the parking grid
 * and similar segmented controls. Full keyboard arrow-key navigation
 * per the ARIA tabs pattern.
 */
export function Tabs({ tabs, defaultTabId, onChange }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);

  function select(id: string) {
    setActiveId(id);
    onChange?.(id);
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "ArrowRight") {
      select(tabs[(index + 1) % tabs.length].id);
    } else if (e.key === "ArrowLeft") {
      select(tabs[(index - 1 + tabs.length) % tabs.length].id);
    }
  }

  return (
    <div role="tablist" className="inline-flex gap-1 rounded-full bg-neutral-100 p-1">
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeId === tab.id}
          tabIndex={activeId === tab.id ? 0 : -1}
          onClick={() => select(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeId === tab.id
              ? "bg-brand-600 text-white"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
