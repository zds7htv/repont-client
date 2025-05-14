import { useEffect, useState } from "react"
import { api } from "../lib/api"
import { format } from "date-fns"

interface FilterBarProps {
  onFilterChange: (filter: {
    from: string
    to: string
    machineId: string | null
    eventType: string | null
  }) => void
}

interface Machine {
  id: number
  name: string
}

function formatForInput(dateStr: string): string {
  const date = new Date(dateStr)
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [machines, setMachines] = useState<Machine[]>([])
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [machineId, setMachineId] = useState<string | null>("all")
  const [eventType, setEventType] = useState<string | null>("all")

  useEffect(() => {
    async function fetchData() {
      try {
        const [mRes, dRes] = await Promise.all([
          api.get("/machines"),
          api.get("/date-range"),
        ])
        setMachines(mRes.data)
        const formattedFrom = formatForInput(dRes.data.start)
        const formattedTo = formatForInput(dRes.data.end)
        setFrom(formattedFrom)
        setTo(formattedTo)
        onFilterChange({
          from: formattedFrom,
          to: formattedTo,
          machineId: "all",
          eventType: null,
        })
      } catch (err) {
        console.error("Hiba a filter adatok lekérdezésénél:", err)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (from && to) {
      onFilterChange({
        from,
        to,
        machineId: machineId === "all" ? null : machineId,
        eventType: eventType === "all" ? null : eventType,
      })
    }
  }, [from, to, machineId, eventType])

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full">
      <div className="flex flex-col w-full sm:w-1/4">
        <select
          value={machineId ?? "all"}
          onChange={(e) => setMachineId(e.target.value)}
          className="border px-3 py-2 rounded-full shadow-sm text-sm w-fit min-w-[80px]"
        >
          <option value="all">Összes gép</option>
          {machines.map((m) => (
            <option key={m.id} value={m.id.toString()}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col w-full sm:w-1/4">
        <input
          type="datetime-local"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border px-3 py-2 rounded-full shadow-sm text-sm w-fit min-w-[140px]"
        />

        <input
          type="datetime-local"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border px-3 py-2 mt-2 rounded-full shadow-sm text-sm w-fit min-w-[140px]"
        />
      </div>

      <div className="flex flex-col w-full sm:w-1/4">
        <select
          value={eventType ?? "all"}
          onChange={(e) => setEventType(e.target.value)}
          className="border px-3 py-2 rounded-full shadow-sm text-sm w-fit min-w-[100px]"
        >
          <option value="all">Összes</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>
    </div>
  )
}

