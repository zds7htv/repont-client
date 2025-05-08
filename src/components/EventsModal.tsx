import React from "react"
import type { FilterData } from "../App"

interface EventData {
  product_name: string
  type_number: string
  machine: string
  event_type: string
  event_date: string
}

interface EventsModalProps {
  open: boolean
  onClose: () => void
  events: EventData[]
  filter: FilterData
  productId: number | null
}

export const EventsModal: React.FC<EventsModalProps> = ({ open, onClose, events }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-md max-w-2xl w-full shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-sm px-2 py-1 bg-red-600 text-white rounded"
          onClick={onClose}
        >
          Bezárás
        </button>
        <h2 className="text-xl font-bold mb-4">Események</h2>
        {events.length === 0 ? (
          <p>Nincs elérhető adat.</p>
        ) : (
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Termék</th>
                  <th>Típus</th>
                  <th>Gép</th>
                  <th>Esemény</th>
                  <th>Dátum</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="py-1">{e.product_name}</td>
                    <td>{e.type_number}</td>
                    <td>{e.machine}</td>
                    <td>{e.event_type}</td>
                    <td>{new Date(e.event_date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

