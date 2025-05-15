// src/components/UploadLog.tsx

import React, { useState } from "react"
import { api } from "../lib/api"

type ValidationResult =
  | { valid: true; type: "products" | "recycling" }
  | { valid: false; error: string }

export const UploadLog: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  const isProductFormat = (item: any) =>
    item &&
    typeof item.type_number === "string" &&
    typeof item.product_name === "string" &&
    Object.keys(item).length === 2

  const isRecyclingFormat = (item: any) =>
    item &&
    typeof item.machine_id === "number" &&
    typeof item.product === "number" &&
    typeof item.event_type === "string" &&
    typeof item.event_date === "string" &&
    typeof item.created_at === "string" &&
    typeof item.updated_at === "string" &&
    Object.keys(item).length === 6

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    setFile(null)
    setValidation(null)
    setUploadStatus(null)

    if (!selected) return

    if (!selected.name.endsWith(".log")) {
      setValidation({ valid: false, error: "Csak .log kiterjesztés engedélyezett!" })
      return
    }

    try {
      const text = await selected.text()
      const json = JSON.parse(text)

      if (!Array.isArray(json)) {
        throw new Error("A fájl gyökérszintje nem tömb.")
      }

      const allProduct = json.every(isProductFormat)
      const allRecycling = json.every(isRecyclingFormat)

      if (allProduct) {
        setFile(selected)
        setValidation({ valid: true, type: "products" })
      } else if (allRecycling) {
        setFile(selected)
        setValidation({ valid: true, type: "recycling" })
      } else {
        throw new Error("A fájlban lévő rekordok nem egységes vagy nem felismerhető formátumúak.")
      }
    } catch (err: any) {
      setValidation({ valid: false, error: err.message || "Ismeretlen hiba történt." })
    }
  }

  const handleUpload = async () => {
    if (!file || !validation || !validation.valid) return

    try {
      const formData = new FormData()
      formData.append("file", file)

      setUploadStatus("Feltöltés folyamatban...")

      const res = await api.post("/upload-log", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setUploadStatus(`Sikeres feltöltés: ${res.data?.message || file.name}`)
      setFile(null)
      setValidation(null)
    } catch (err: any) {
      setUploadStatus(`Hiba történt: ${err.response?.data?.error || "Ismeretlen hiba."}`)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow border mt-10 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Log fájl feltöltése</h2>

      <input
        type="file"
        accept=".log"
        onChange={handleFileChange}
        className="block mb-3 text-sm"
      />

      {validation && !validation.valid && (
        <p className="text-red-600 font-medium">{validation.error}</p>
      )}

      {validation && validation.valid && (
        <div className="text-green-700 mb-3">
          Érvényes fájl ({validation.type} típus)
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || !validation || !validation.valid}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        Feltöltés
      </button>

      {uploadStatus && (
        <p className="mt-3 text-sm font-medium">
          {uploadStatus.startsWith("Hiba") ? (
            <span className="text-red-600">{uploadStatus}</span>
          ) : (
            <span className="text-green-700">{uploadStatus}</span>
          )}
        </p>
      )}
    </div>
  )
}
