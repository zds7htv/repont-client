import React, { useEffect, useState } from "react"
import { api } from "../lib/api"
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
  filter: FilterData
  productId: number | null
  events: EventData[]
}

export const EventsModal: React.FC<EventsModalProps> = ({ open, onClose, filter, productId }) => {
  const [limit, setLimit] = useState<number>(100)
  const [fastEvents, setFastEvents] = useState<EventData[]>([])
  const [allEvents, setAllEvents] = useState<EventData[]>([])
  const [visibleEvents, setVisibleEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(false)
  const [responseTime, setResponseTime] = useState<number | null>(null)

  // Resetelés modal bezáráskor
  useEffect(() => {
    if (!open) {
      setLimit(100)
      setFastEvents([])
      setAllEvents([])
      setVisibleEvents([])
      setResponseTime(null)
    }
  }, [open])

  // 1. Gyors lekérés 100 sorral
  useEffect(() => {
    if (!open || !productId) return

    const fetchFastEvents = async () => {
      setLoading(true)
      const start = performance.now()
      try {
        const res = await api.get<EventData[]>("/events", {
          params: {
            from: filter.from,
            to: filter.to,
            machine_id: filter.machineId ?? "all",
            product_id: productId,
            limit: 100,
          },
        })
        setFastEvents(res.data)
        setVisibleEvents(res.data.slice(0, limit))
        setResponseTime(Math.round(performance.now() - start))
      } catch (err) {
        console.error("Gyors esemény lekérés sikertelen:", err)
        setFastEvents([])
        setVisibleEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchFastEvents()
  }, [open, productId, filter])

  // 2. Teljes adat háttérben
  useEffect(() => {
    if (!open || !productId) return

    const fetchAllEvents = async () => {
      try {
        const res = await api.get<EventData[]>("/events", {
          params: {
            from: filter.from,
            to: filter.to,
            machine_id: filter.machineId ?? "all",
            product_id: productId,
            limit: -1,
          },
        })
        setAllEvents(res.data)
      } catch (err) {
        console.warn("Háttér teljes lekérés sikertelen:", err)
      }
    }

    fetchAllEvents()
  }, [open, productId, filter])

  // 3. Limit változásra jelenítsük meg a megfelelő adatokat
  useEffect(() => {
    const source = allEvents.length > 0 ? allEvents : fastEvents
    if (limit === -1) {
      setVisibleEvents(source)
    } else {
      setVisibleEvents(source.slice(0, limit))
    }
  }, [limit, fastEvents, allEvents])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-md w-fit max-w-full shadow-lg relative pr-16">
        <button
          className="absolute top-3 right-3 text-sm px-2 py-1 bg-red-600 text-white rounded"
          onClick={onClose}
        >
          ×
        </button>

        <div className="mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm">
          <h2 className="text-xl font-bold">
            Események – <span className="text-base font-medium">{visibleEvents.length} sor</span>
          </h2>
          <div className="flex items-center gap-4">
            {responseTime !== null && (
              <span className="text-sm text-gray-500">Válaszidő: {responseTime} ms</span>
            )}
            <label htmlFor="limitSelect" className="mr-1">Limit:</label>
            <select
              id="limitSelect"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="border px-2 py-1 rounded"
            >
              {[100, 1000, 10000, 50000].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
              <option value={-1}>Összes</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Betöltés...</p>
        ) : visibleEvents.length === 0 ? (
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
                {visibleEvents.map((e, idx) => (
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
