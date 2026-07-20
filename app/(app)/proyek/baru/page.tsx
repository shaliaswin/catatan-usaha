"use client";

import { useState } from "react";
import { createProject } from "@/lib/actions/projects";
import { BUSINESS_TYPE_LABELS } from "@/lib/utils";
import DatePicker from "@/components/date-picker";

export default function NewProjectPage() {
  const [startDate, setStartDate] = useState("");

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold mb-4">Proyek Baru</h1>
      <form action={createProject} className="card space-y-4">
        <div>
          <label className="label">Nama Proyek</label>
          <input
            name="name"
            className="input"
            placeholder="Contoh: Pagar BRC - Bpk. Andi"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nama Klien</label>
            <input name="clientName" className="input" required />
          </div>
          <div>
            <label className="label">No. HP Klien</label>
            <input name="clientPhone" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Jenis Usaha</label>
          <select name="businessType" className="input" required>
            {Object.entries(BUSINESS_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nilai Kontrak (Rp)</label>
            <input
              name="contractValue"
              type="number"
              min="0"
              step="1000"
              className="input"
              placeholder="0"
              required
            />
          </div>
          <div>
            <label className="label">Tanggal Mulai</label>
            <DatePicker
              name="startDate"
              value={startDate}
              onChange={setStartDate}
            />
          </div>
        </div>

        <div>
          <label className="label">Lokasi</label>
          <input name="location" className="input" placeholder="Opsional" />
        </div>

        <div>
          <label className="label">Catatan</label>
          <textarea name="notes" className="input" rows={3} />
        </div>

        <button type="submit" className="btn-primary w-full">
          Simpan Proyek
        </button>
      </form>
    </div>
  );
}
