import { useAppSettingsContext } from '../../hooks/useAppSettingsContext'
import type { AcademicPeriodType } from '../../hooks/useSchoolApplication'

export function SettingsSection() {
  const {
    hasUnsavedAppSettingsChanges,
    handleSettingsAction,
    isLoadingClasses,
    academicPeriodType,
    setAcademicPeriodType,
    semesterPeriods,
    trimesterPeriods,
    updatePeriodDate,
    inactiveLogoutMinutes,
    setInactiveLogoutMinutes,
    normalizePositiveInteger,
    DEFAULT_INACTIVITY_LOGOUT_MINUTES,
    messageTimeoutSeconds,
    setMessageTimeoutSeconds,
    DEFAULT_MESSAGE_TIMEOUT_SECONDS,
    evaluationMomentTemplates,
    addEvaluationMomentTemplate,
    updateEvaluationMomentTemplate,
    removeEvaluationMomentTemplate,
    percentageRanges,
    updatePercentageRange,
  } = useAppSettingsContext()
  const hasUnsavedChanges = hasUnsavedAppSettingsChanges()

  return (
    (
              <section className="students-panel settings-panel" aria-label="Configurações da aplicação">
                <form className="settings-form" onSubmit={handleSettingsAction}>
                  <div className="students-panel-heading">
                    <h2>Configurações gerais</h2>
                    <button
                      type="submit"
                      className={`settings-action-button ${hasUnsavedChanges ? 'save' : 'close'}`}
                      disabled={isLoadingClasses}
                    >
                      {hasUnsavedChanges ? 'Gravar configurações' : 'Fechar configurações'}
                    </button>
                  </div>
                  <section className="settings-periods" aria-label="Períodos do ano letivo">
                    <div>
                      <h3>Períodos do ano letivo</h3>
                      <p>Define se o ano letivo é dividido em semestres ou trimestres e as respetivas datas.</p>
                    </div>
                    <label className="settings-period-type-label">
                      Tipo de período
                      <select
                        value={academicPeriodType}
                        onChange={(e) => setAcademicPeriodType(e.target.value as AcademicPeriodType)}
                      >
                        <option value="semestres">Semestres</option>
                        <option value="trimestres">Trimestres</option>
                      </select>
                    </label>
                    <div className="settings-periods-table" role="table" aria-label="Datas dos períodos">
                      <div className="settings-periods-row settings-periods-head" role="row">
                        <span role="columnheader">Período</span>
                        <span role="columnheader">Data de início</span>
                        <span role="columnheader">Data de fim</span>
                      </div>
                      {(academicPeriodType === 'semestres' ? semesterPeriods : trimesterPeriods).map((period) => (
                        <div className="settings-periods-row" role="row" key={period.id}>
                          <span className="settings-period-label">{period.label}</span>
                          <div role="cell">
                            <input
                              type="date"
                              aria-label={`${period.label} — início`}
                              value={period.startDate}
                              onChange={(e) => updatePeriodDate(academicPeriodType, period.id, 'startDate', e.target.value)}
                            />
                          </div>
                          <div role="cell">
                            <input
                              type="date"
                              aria-label={`${period.label} — fim`}
                              value={period.endDate}
                              onChange={(e) => updatePeriodDate(academicPeriodType, period.id, 'endDate', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <div className="settings-grid">
                    <label>
                      Terminar sessão por inatividade (minutos)
                      <input
                        type="number"
                        min="1"
                        value={inactiveLogoutMinutes}
                        onChange={(event) =>
                          setInactiveLogoutMinutes(
                            normalizePositiveInteger(
                              event.target.value,
                              DEFAULT_INACTIVITY_LOGOUT_MINUTES,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      Tempo das mensagens no ecrã (segundos)
                      <input
                        type="number"
                        min="1"
                        value={messageTimeoutSeconds}
                        onChange={(event) =>
                          setMessageTimeoutSeconds(
                            normalizePositiveInteger(
                              event.target.value,
                              DEFAULT_MESSAGE_TIMEOUT_SECONDS,
                            ),
                          )
                        }
                      />
                    </label>
                  </div>
                  <section
                    className="settings-templates"
                    aria-label="Templates de momentos de avaliação"
                  >
                    <div className="settings-templates-heading">
                      <div>
                        <h3>Templates de momentos de avaliação</h3>
                        <p>
                          Define os tipos de momentos de avaliação e a ponderação
                          percentual associada a cada um.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={addEvaluationMomentTemplate}
                      >
                        Adicionar template
                      </button>
                    </div>
                    {evaluationMomentTemplates.length === 0 ? (
                      <p className="settings-templates-empty">
                        Ainda não existem templates de momentos de avaliação.
                      </p>
                    ) : (
                      <div
                        className="settings-templates-table"
                        role="table"
                        aria-label="Templates de momentos de avaliação"
                      >
                        <div className="settings-templates-row settings-templates-head" role="row">
                          <span role="columnheader">Tipo de momento de avaliação</span>
                          <span role="columnheader">Ponderação (%)</span>
                          <span role="columnheader">Ações</span>
                        </div>
                        {evaluationMomentTemplates.map((template) => (
                          <div className="settings-templates-row" role="row" key={template.id}>
                            <label role="cell">
                              <span>Tipo de momento de avaliação</span>
                              <input
                                type="text"
                                value={template.type}
                                maxLength={100}
                                placeholder="Ex: Teste"
                                required
                                onChange={(event) =>
                                  updateEvaluationMomentTemplate(
                                    template.id,
                                    'type',
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label role="cell">
                              <span>Ponderação (%)</span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={template.weightPercentage}
                                required
                                onChange={(event) =>
                                  updateEvaluationMomentTemplate(
                                    template.id,
                                    'weightPercentage',
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <div className="settings-template-actions" role="cell">
                              <button
                                type="button"
                                className="transparent-button"
                                onClick={() => removeEvaluationMomentTemplate(template.id)}
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                  <section className="settings-ranges" aria-label="Cores da percentagem">
                    <div>
                      <h3>Cores da percentagem</h3>
                      <p>Define os intervalos usados na coluna % da grelha Alunos/M.Avaliação.</p>
                    </div>
                    <div className="settings-ranges-table" role="table" aria-label="Intervalos de percentagem">
                      <div className="settings-ranges-row settings-ranges-head" role="row">
                        <span role="columnheader">Mín.</span>
                        <span role="columnheader">Máx.</span>
                        <span role="columnheader">Fundo</span>
                        <span role="columnheader">Texto</span>
                        <span role="columnheader">Exemplo</span>
                      </div>
                      {percentageRanges.map((range) => (
                        <div className="settings-ranges-row" role="row" key={range.id}>
                          <label role="cell">
                            <span>Mín.</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={range.min}
                              onChange={(event) => updatePercentageRange(range.id, 'min', event.target.value)}
                            />
                          </label>
                          <label role="cell">
                            <span>Máx.</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={range.max}
                              onChange={(event) => updatePercentageRange(range.id, 'max', event.target.value)}
                            />
                          </label>
                          <label role="cell">
                            <span>Fundo</span>
                            <input
                              type="color"
                              value={range.backgroundColor}
                              onChange={(event) =>
                                updatePercentageRange(range.id, 'backgroundColor', event.target.value)
                              }
                            />
                          </label>
                          <label role="cell">
                            <span>Texto</span>
                            <input
                              type="color"
                              value={range.textColor}
                              onChange={(event) =>
                                updatePercentageRange(range.id, 'textColor', event.target.value)
                              }
                            />
                          </label>
                          <div role="cell" className="settings-ranges-preview">
                            <span
                              className="assessment-percentage"
                              style={{ backgroundColor: range.backgroundColor, color: range.textColor }}
                            >
                              {range.min}–{range.max}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </form>
              </section>
            )
  )
}
