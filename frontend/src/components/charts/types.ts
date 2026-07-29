export type AssessmentChartDatum = {
  name: string
  Nota: number
  Máximo?: number
}

export type AssessmentChartProps = {
  data: AssessmentChartDatum[]
  isAllStudents: boolean
  palette: string[]
  primaryColor: string
  secondaryColor: string
}
