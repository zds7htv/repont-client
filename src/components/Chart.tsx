import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

interface ChartProps {
  data: {
    product_name: string
    count: number
    product_id: number
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

  const CustomLabel = ({ x, y, width, height, index }: any) => {
    const label = data[index]?.product_name
    if (!label) return null
    const centerX = x + width / 2
    const centerY = y + height / 2

    return (
      <g transform={`translate(${centerX}, ${centerY})`}>
        <text
          transform="rotate(-90)"
          textAnchor="middle"
          fill="#ffffff"
          fontSize={12}
          fontWeight="bold"
        >
          {label}
        </text>
      </g>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const { product_name, count } = payload[0].payload
      return (
        <div className="bg-white text-black shadow-md border rounded px-3 py-2 text-sm">
          <div><strong>{product_name}</strong></div>
          <div>{count} db</div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[400px] bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mt-6 border border-gray-200">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis hide />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            fill="#009EE2"
            onClick={(entry) => onBarClick(entry.product_id)}
            label={<CustomLabel />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
