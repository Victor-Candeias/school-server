import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AssessmentChartProps } from './types'

export function AreaChart({
  data,
  isAllStudents,
  palette,
  primaryColor,
  secondaryColor,
}: AssessmentChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320} className="chart-responsive-container">
      <RechartsAreaChart data={data} margin={{ top: 24, right: 24, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="Nota"
          stroke={primaryColor}
          fill={primaryColor}
          fillOpacity={0.2}
          strokeWidth={2}
          dot={isAllStudents
            ? (props: { index?: number; cx?: number; cy?: number }) => (
                <circle
                  key={props.index ?? 0}
                  cx={props.cx ?? 0}
                  cy={props.cy ?? 0}
                  r={5}
                  fill={palette[(props.index ?? 0) % palette.length]}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              )
            : { r: 4 }}
        >
          {!isAllStudents && (
            <LabelList dataKey="Nota" position="top" style={{ fontSize: 10, fontWeight: 700 }} />
          )}
        </Area>
        {!isAllStudents && (
          <Area
            type="monotone"
            dataKey="Máximo"
            stroke={secondaryColor}
            fill={secondaryColor}
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        )}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}
