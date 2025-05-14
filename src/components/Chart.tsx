import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"

interface ChartProps {
  data: {
    product_name: string
    product_id: number
    success: number
    warning: number
    error: number
  }[]
  onBarClick: (productId: number) => void
}

export const Chart: React.FC<ChartProps> = ({ data, onBarClick }) => {
  if (!data || data.length === 0)
    return (
      <p className="text-center text-gray-500 mt-10 text-lg">
        Nincs megjeleníthető adat.
      </p>
    )

  const MIN_HEIGHT = 2

  const visualData = data.map((entry) => {
    const total = entry.success + entry.warning + entry.error
    return {
      ...entry,
      success_draw:
        entry.success > 0
          ? entry.success
          : total > 0
          ? MIN_HEIGHT
          : 0,
      warning_draw:
        entry.warning > 0
          ? entry.warning
          : total > 0
          ? MIN_HEIGHT
          : 0,
      error_draw:
        entry.error > 0
          ? entry.error
          : total > 0
          ? MIN_HEIGHT
          : 0
    }
  })

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const { product_name, success, warning, error } = payload[0].payload
      return (
        <div className="bg-white text-black shadow-md border rounded px-3 py-2 text-sm">
          <div>
            <strong>{product_name}</strong>
          </div>
          <div>Success: {success}</div>
          <div>Warning: {warning}</div>
          <div>Error: {error}</div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[400px] bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mt-6 border border-gray-200">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={visualData}
          margin={{ top: 20, right: 20, left: 20, bottom: 50 }}
          barCategoryGap={20}
          onClick={(e: any) => {
            const productId = e?.activePayload?.[0]?.payload?.product_id
            if (productId) onBarClick(productId)
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="product_name"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="success_draw" stackId="stack" fill="#a8e6a1" />
          <Bar dataKey="warning_draw" stackId="stack" fill="#ffe49c" />
          <Bar dataKey="error_draw" stackId="stack" fill="#f8a5a5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
