import { useEffect, useState } from "react"
import { api } from "../lib/api"
import { format } from "date-fns"

interface FilterBarProps {
  onFilterChange: (filter: { from: string; to: string; machineId: string | null }) => void
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
          from: dRes.data.start,
          to: dRes.data.end,
          machineId: "all",
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
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
        machineId: machineId === "all" ? null : machineId,
      })
    }
  }, [from, to, machineId])

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
    </div>
  )
}
