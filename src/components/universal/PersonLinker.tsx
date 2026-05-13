"use client";

import React, { useState } from "react";
import { HiPlus, HiTrash } from "react-icons/hi2";

export interface PersonLink {
  id?: string;
  nama: string;
}

interface DosenOption {
  id: string;
  nama: string;
}

interface PersonLinkerProps {
  label: string;
  dosenOptions: DosenOption[];
  value: PersonLink[];
  onChange: (value: PersonLink[]) => void;
  /** If true, only one person can be selected (no add button). */
  single?: boolean;
}

const CUSTOM_KEY = "__custom__";

export default function PersonLinker({ label, dosenOptions, value, onChange, single }: PersonLinkerProps) {
  // Track which rows are in "custom name" mode
  const [customModes, setCustomModes] = useState<boolean[]>(() =>
    value.map((p) => !p.id || !dosenOptions.some((d) => d.id === p.id))
  );

  const updatePerson = (index: number, person: PersonLink) => {
    const next = [...value];
    next[index] = person;
    onChange(next);
  };

  const handleSelectChange = (index: number, selectValue: string) => {
    if (selectValue === CUSTOM_KEY) {
      // Switch to custom mode, keep current nama or blank
      const modes = [...customModes];
      modes[index] = true;
      setCustomModes(modes);
      updatePerson(index, { nama: value[index]?.nama || "" });
    } else if (selectValue === "") {
      // placeholder — clear
      updatePerson(index, { nama: "" });
    } else {
      const dosen = dosenOptions.find((d) => d.id === selectValue);
      if (dosen) {
        const modes = [...customModes];
        modes[index] = false;
        setCustomModes(modes);
        updatePerson(index, { id: dosen.id, nama: dosen.nama });
      }
    }
  };

  const handleCustomNameChange = (index: number, nama: string) => {
    updatePerson(index, { nama });
  };

  const addRow = () => {
    onChange([...value, { nama: "" }]);
    setCustomModes([...customModes, false]);
  };

  const removeRow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setCustomModes(customModes.filter((_, i) => i !== index));
  };

  // For single mode, ensure at least one row exists
  const rows = single ? (value.length === 0 ? [{ nama: "" } as PersonLink] : [value[0]]) : value;

  // Sync single mode initial value
  React.useEffect(() => {
    if (single && value.length === 0) {
      onChange([{ nama: "" }]);
      setCustomModes([false]);
    }
  }, [single]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="space-y-2">
        {rows.map((person, idx) => {
          const isCustom = customModes[idx] ?? false;
          const selectedId = isCustom ? CUSTOM_KEY : (person.id || "");

          return (
            <div key={idx} className="flex items-center gap-2">
              <select
                value={selectedId}
                onChange={(e) => handleSelectChange(idx, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">— Pilih Dosen —</option>
                {dosenOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama}
                  </option>
                ))}
                <option value={CUSTOM_KEY}>✏️ Nama Lainnya...</option>
              </select>

              {isCustom && (
                <input
                  type="text"
                  placeholder="Ketik nama..."
                  value={person.nama}
                  onChange={(e) => handleCustomNameChange(idx, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              )}

              {!single && (
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!single && (
        <button
          type="button"
          onClick={addRow}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <HiPlus className="w-3.5 h-3.5" />
          Tambah {label}
        </button>
      )}
    </div>
  );
}
