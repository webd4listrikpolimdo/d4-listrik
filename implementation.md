# Karya Metadata CRUD — Phased Implementation

## Summary
Add dynamic metadata form fields per karya `jenis` in dashboards, with combobox-style dosen selectors for person links (penulis, ketua, anggota). Update detail page to display metadata.

## Metadata per Jenis

| Jenis | Fields |
|---|---|
| publikasi | jurnal, link, penulis (PersonLink[]) |
| penelitian | sumberDana, ketua (PersonLink), anggota (PersonLink[]) |
| pengabdian | mitra, ketua (PersonLink), anggota (PersonLink[]) |
| bukuAjar | penerbit, isbn, penulis (PersonLink[]) |
| hki | jenisHki, nomorSertifikat |
| sertifikasi | penyelenggara, linkSertifikat |

PersonLink = `{ id?: string, nama: string }` — stored in metadata JSONB.

---

## Phase 1 — PersonLinker Component
**File:** `src/components/universal/PersonLinker.tsx` [NEW]

Reusable component: dynamic list of combobox selects. Each row = one person. "Add" button adds a row. Each row has a `<select>` of dosen + a "custom name" option. Props: `dosenOptions`, `value: PersonLink[]`, `onChange`, `label`, `single?: boolean`.

---

## Phase 2 — Admin Karya Modal
**File:** `src/app/dashboard/admin/karya/page.tsx` [MODIFY]

- Add metadata state to the form
- Render jenis-specific fields + PersonLinker below existing fields
- Build `metadata` object on submit, send to API
- Pre-populate metadata when editing

---

## Phase 3 — Dosen Karya Modal
**File:** `src/app/dashboard/dosen/karya/page.tsx` [MODIFY]

Same as Phase 2 but for the dosen "Ajukan Karya" modal. Uses PersonLinker. Sends metadata to karya-pending API.

---

## Phase 4 — Karya Detail Page
**File:** `src/app/dosen/[id]/karya/[kategori]/[karyaId]/page.tsx` [MODIFY]

Update `renderSpecificDetails()` to handle both old PersonLink objects and new metadata format. Display all metadata fields per jenis.

---

## Execution
Each phase = 1 prompt. Say "Phase N" to execute.
**Use less token/credit so not exceed limit.**
