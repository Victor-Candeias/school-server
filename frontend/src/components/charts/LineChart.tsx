import {
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AssessmentChartProps } from './types'

export function LineChart({
  data,
  isAllStudents,
  palette,
  primaryColor,
  secondaryColor,
}: AssessmentChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320} className="chart-responsive-container">
      <RechartsLineChart data={data} margin={{ top: 24, right: 24, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="Nota"
          stroke={primaryColor}
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
        </Line>
        {!isAllStudents && (
          <Line
            type="monotone"
            dataKey="Máximo"
            stroke={secondaryColor}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
