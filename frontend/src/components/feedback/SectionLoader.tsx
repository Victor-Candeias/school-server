type SectionLoaderProps = {
  label?: string
}

export function SectionLoader({ label = 'A carregar...' }: SectionLoaderProps) {
  return (
    <p className="dashboard-feedback info" role="status" aria-live="polite">
      {label}
    </p>
  )
}
