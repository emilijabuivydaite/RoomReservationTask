import { useId, useState, type ReactNode } from 'react';

interface Props {
  title?: string;
  activeCount?: number; // how many filters are currently applied
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function FilterAccordion({
  title = 'Filters',
  activeCount = 0,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="accordion shadow-sm mb-4">
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            type="button"
            className={`btn-subtle theme-accent accordion-button ${open ? '' : 'collapsed'}`}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen(!open)}
          >
            {title}
            {activeCount > 0 && (
              <span className="badge text-bg-primary ms-2">{activeCount}</span>
            )}
          </button>
        </h2>
        <div
          id={panelId}
          className={`accordion-collapse collapse ${open ? 'show' : ''}`}
        >
          <div className="accordion-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
