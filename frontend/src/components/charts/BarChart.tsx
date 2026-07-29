import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AssessmentChartProps } from './types'

export function BarChart({
  data,
  isAllStudents,
  palette,
  primaryColor,
  secondaryColor,
}: AssessmentChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320} className="chart-responsive-container">
      <RechartsBarChart data={data} margin={{ top: 24, right: 24, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Nota" fill={primaryColor} radius={[4, 4, 0, 0]}>
          {isAllStudents
            ? data.map((_, index) => (
                <Cell key={index} fill={palette[index % palette.length]} />
              ))
            : <LabelList dataKey="Nota" position="top" style={{ fontSize: 10, fontWeight: 700 }} />}
        </Bar>
        {!isAllStudents && (
          <Bar dataKey="Máximo" fill={secondaryColor} radius={[4, 4, 0, 0]} opacity={0.4} />
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
