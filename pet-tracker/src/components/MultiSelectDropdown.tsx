import { useEffect, useRef, useState } from 'react'

interface MultiSelectDropdownProps {
  options: string[]
  selected: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}

export function MultiSelectDropdown({ options, selected, onChange, placeholder = 'Auswählen…' }: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function toggle(opt: string) {
    onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt])
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full truncate rounded-lg border border-neutral-300 bg-white px-3 py-2 text-left text-sm text-neutral-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        {selected.length > 0 ? selected.join(', ') : <span className="text-neutral-400">{placeholder}</span>}
      </button>
      {open && (
        <div className="absolute z-10 mt-1 max-h-56 w-full min-w-[12rem] overflow-auto rounded-lg border border-neutral-200 bg-white p-1 shadow-lg">
          {options.length === 0 && <p className="px-2 py-1 text-sm text-neutral-400">Keine Komponenten hinterlegt</p>}
          {options.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-brand-50">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="h-4 w-4 rounded text-brand-600 focus:ring-brand-400" />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
