import { useEffect, useState } from "react"
import { api } from "./lib/api"
import { FilterBar } from "./components/FilterBar"
import { Chart } from "./components/Chart"
import { EventsModal } from "./components/EventsModal"
import Login from "./Login"

export interface FilterData {
  from: string
  to: string
  machineId: string | null
  eventType?: string | null
}

export interface LeaderboardEntry {
  product_id: number
  product_name: string
  success: number
  warning: number
  error: number
  clickZone?: number
}

export interface EventData {
  product_name: string
  type_number: string
  machine: string
  event_type: string
  event_date: string
}

function App() {
  const [filter, setFilter] = useState<FilterData | null>(null)
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [events, setEvents] = useState<EventData[]>([])
  const [modalProductId, setModalProductId] = useState<number | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("loggedIn") === "true"
    setLoggedIn(isLoggedIn)
  }, [])

  useEffect(() => {
    if (!filter) return

    const params: any = {
      from: filter.from,
      to: filter.to,
      machine_id: filter.machineId ?? "all",
    }

    if (filter.eventType && filter.eventType !== "all") {
      params.event_type = filter.eventType
    }

    api
      .get<LeaderboardEntry[]>("/leaderboard", { params })
      .then((res) => {
        const withClickZone = res.data.map((item) => ({
          ...item,
          clickZone: 1,
        }))
        setData(withClickZone)
      })
      .catch((err) => console.error("Leaderboard lekérés hiba:", err))
  }, [filter])

  const handleBarClick = async (productId: number) => {
    if (!filter) return
    setModalProductId(productId)

    const params: any = {
      from: filter.from,
      to: filter.to,
      machine_id: filter.machineId ?? "all",
      product_id: productId,
    }

    if (filter.eventType && filter.eventType !== "all") {
      params.event_type = filter.eventType
    }

    try {
      const res = await api.get<EventData[]>("/events", { params })
      setEvents(res.data)
    } catch (err) {
      console.error("Események lekérése sikertelen:", err)
    }
  }

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />

  return (
    <div className="min-h-screen bg-[#d5e000] text-[#2b2b2b] font-sans">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold border-b-4 border-[#00b0d7] inline-block">
            Repont statisztika
          </h1>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => {
              sessionStorage.removeItem("loggedIn")
              setLoggedIn(false)
            }}
          >
            Kilépés
          </button>
        </div>

        <FilterBar onFilterChange={setFilter} />

        {data.length > 0 ? (
          <Chart data={data} onBarClick={handleBarClick} />
        ) : (
          <p className="mt-10 text-center text-lg font-semibold">Nincs megjeleníthető adat.</p>
        )}

        <EventsModal
          open={modalProductId !== null}
          onClose={() => setModalProductId(null)}
          productId={modalProductId}
          filter={filter!}
          events={events}
        />
      </div>
    </div>
  )
}

export default App
