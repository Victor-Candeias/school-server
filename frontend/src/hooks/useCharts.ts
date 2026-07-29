import type { SchoolDocument } from '../api/school'
import type { ChartType } from '../types'
import type { ApplicationActions, ApplicationRuntime } from './applicationRuntime'

export function useCharts(
  runtime: ApplicationRuntime,
): Pick<ApplicationActions, 'getChartData' | 'getChartTypeLabel' | 'nextChartType' | 'exportChartToPdf'> {
function getChartData(student: SchoolDocument) {
    const moments = runtime.selectedClass ? runtime.getEvaluationMomentsForClass(runtime.selectedClass) : []
    return moments.map((moment) => {
      const total = runtime.getStudentSavedMomentTotal(student, moment)
      const max = runtime.getEvaluationMomentMaxValue(moment) || 100
      return {
        name: runtime.getStringValue(moment.name) as string,
        Nota: total,
        Máximo: max,
        '%': Math.round((total / max) * 100),
      }
    })
  }

function getChartTypeLabel(type: ChartType) {
    const labels: Record<ChartType, string> = {
      bar: '📊 Barras',
      line: '📈 Linhas',
      area: '🌊 Área',
      radar: '🕸 Radar',
    }
    return labels[type]
  }

function nextChartType() {
    const order: ChartType[] = ['bar', 'line', 'area', 'radar']
    runtime.setChartType((prev) => order[(order.indexOf(prev) + 1) % order.length])
  }

function exportChartToPdf() {
    window.print()
  }

  return {
    getChartData,
    getChartTypeLabel,
    nextChartType,
    exportChartToPdf,
  }
}
