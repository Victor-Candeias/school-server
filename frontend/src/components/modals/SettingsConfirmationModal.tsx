import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'

type SettingsConfirmationModalProps = {
  model: Pick<
    SchoolApplicationModel,
    | 'saveAndCloseSettings'
    | 'discardAndCloseSettings'
    | 'cancelSettingsClose'
    | 'isLoadingClasses'
    | 'classesError'
  >
}

export function SettingsConfirmationModal({ model }: SettingsConfirmationModalProps) {
  const {
    saveAndCloseSettings,
    discardAndCloseSettings,
    cancelSettingsClose,
    isLoadingClasses,
    classesError,
  } = model

  return (
    <div className="modal-backdrop settings-confirmation-backdrop" role="presentation">
      <section
        className="modal-card small-modal-card settings-confirmation-card"
        aria-labelledby="settings-confirmation-title"
        aria-describedby="settings-confirmation-description"
        role="dialog"
        aria-modal="true"
      >
        <h2 id="settings-confirmation-title">Alterações por gravar</h2>
        <p id="settings-confirmation-description">
          Queres gravar as alterações antes de fechar as configurações?
        </p>
        {classesError && <p className="modal-feedback error">{classesError}</p>}
        <div className="settings-confirmation-actions">
          <button
            type="button"
            className="settings-confirmation-save"
            onClick={() => void saveAndCloseSettings()}
            disabled={isLoadingClasses}
          >
            {isLoadingClasses ? 'A gravar...' : 'Gravar e sair'}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={discardAndCloseSettings}
            disabled={isLoadingClasses}
          >
            Sair sem gravar
          </button>
          <button
            type="button"
            className="transparent-button"
            onClick={cancelSettingsClose}
            disabled={isLoadingClasses}
          >
            Cancelar
          </button>
        </div>
      </section>
    </div>
  )
}
