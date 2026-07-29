import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { AssessmentChartProps } from './types'

export function RadarChart({
  data,
  isAllStudents,
  primaryColor,
  secondaryColor,
}: AssessmentChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320} className="chart-responsive-container">
      <RechartsRadarChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis tick={{ fontSize: 10 }} />
        <Radar
          name="Nota"
          dataKey="Nota"
          stroke={primaryColor}
          fill={primaryColor}
          fillOpacity={0.35}
        />
        {!isAllStudents && (
          <Radar
            name="Máximo"
            dataKey="Máximo"
            stroke={secondaryColor}
            fill={secondaryColor}
            fillOpacity={0.1}
          />
        )}
        <Legend />
        <Tooltip />
      </RechartsRadarChart>
    </ResponsiveContainer>
  )
}
