import { useState } from 'react'
import { useAppSettingsContext } from '../../hooks/useAppSettingsContext'
import type { AcademicPeriodType } from '../../hooks/useSchoolApplication'
import { normalizeDecimalInput } from '../../utils/validation'
import { normalizeIntegerInput } from '../../utils/validation'

export function SettingsSection() {
  const [weightInputDrafts, setWeightInputDrafts] = useState<Record<string, string>>({})
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
    popupBackgroundColor,
    setPopupBackgroundColor,
    popupTextColor,
    setPopupTextColor,
    errorPopupBackgroundColor,
    setErrorPopupBackgroundColor,
    errorPopupTextColor,
    setErrorPopupTextColor,
    evaluationMomentTemplates,
    addEvaluationMomentTemplate,
    updateEvaluationMomentTemplate,
    removeEvaluationMomentTemplate,
    attitudeTemplates,
    addAttitudeTemplate,
    updateAttitudeTemplate,
    removeAttitudeTemplate,
    percentageRanges,
    updatePercentageRange,
  } = useAppSettingsContext()
  const hasUnsavedChanges = hasUnsavedAppSettingsChanges()
  const getWeightInputValue = (templateId: string, weightPercentage: number) =>
    weightInputDrafts[templateId] ?? String(weightPercentage)
  const updateWeightInputDraft = (
    templateId: string,
    updateTemplate: (value: string) => void,
    value: string,
  ) => {
    const normalizedValue = normalizeDecimalInput(value, 2)
    setWeightInputDrafts((currentDrafts) => ({
      ...currentDrafts,
      [templateId]: normalizedValue,
    }))

    if (normalizedValue === '' || normalizedValue.endsWith('.')) {
      return
    }

    updateTemplate(normalizedValue)
  }
  const clearWeightInputDraft = (templateId: string) => {
    setWeightInputDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts }
      delete nextDrafts[templateId]
      return nextDrafts
    })
  }

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
                        type="text"
                        inputMode="numeric"
                        value={inactiveLogoutMinutes}
                        onFocus={(event) => event.currentTarget.select()}
                        onChange={(event) =>
                          setInactiveLogoutMinutes(
                            normalizePositiveInteger(
                              normalizeIntegerInput(event.target.value),
                              DEFAULT_INACTIVITY_LOGOUT_MINUTES,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      Tempo das mensagens no ecrã (segundos)
                      <input
                        type="text"
                        inputMode="numeric"
                        value={messageTimeoutSeconds}
                        onFocus={(event) => event.currentTarget.select()}
                        onChange={(event) =>
                          setMessageTimeoutSeconds(
                            normalizePositiveInteger(
                              normalizeIntegerInput(event.target.value),
                              DEFAULT_MESSAGE_TIMEOUT_SECONDS,
                            ),
                          )
                        }
                      />
                    </label>
                  </div>
                  <section className="settings-popup-colors" aria-label="Cores dos popups de aviso">
                    <div>
                      <h3>Cores dos popups de aviso</h3>
                      <p>Define o fundo e a cor da letra usados nas mensagens de sucesso.</p>
                    </div>
                    <div className="settings-popup-colors-controls">
                      <label>
                        Cor de fundo
                        <input
                          type="color"
                          value={popupBackgroundColor}
                          onChange={(event) => setPopupBackgroundColor(event.target.value)}
                        />
                      </label>
                      <label>
                        Cor da letra
                        <input
                          type="color"
                          value={popupTextColor}
                          onChange={(event) => setPopupTextColor(event.target.value)}
                        />
                      </label>
                      <div className="settings-popup-colors-preview">
                        <span
                          style={{
                            backgroundColor: popupBackgroundColor,
                            color: popupTextColor,
                          }}
                        >
                          Exemplo de aviso
                        </span>
                      </div>
                    </div>
                  </section>
                  <section className="settings-popup-colors" aria-label="Cores dos popups de erro">
                    <div>
                      <h3>Cores dos popups de erro</h3>
                      <p>Define o fundo e a cor da letra usados nas mensagens de erro.</p>
                    </div>
                    <div className="settings-popup-colors-controls">
                      <label>
                        Cor de fundo
                        <input
                          type="color"
                          value={errorPopupBackgroundColor}
                          onChange={(event) => setErrorPopupBackgroundColor(event.target.value)}
                        />
                      </label>
                      <label>
                        Cor da letra
                        <input
                          type="color"
                          value={errorPopupTextColor}
                          onChange={(event) => setErrorPopupTextColor(event.target.value)}
                        />
                      </label>
                      <div className="settings-popup-colors-preview">
                        <span
                          style={{
                            backgroundColor: errorPopupBackgroundColor,
                            color: errorPopupTextColor,
                          }}
                        >
                          Exemplo de erro
                        </span>
                      </div>
                    </div>
                  </section>
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
                          <span role="columnheader">Fundo</span>
                          <span role="columnheader">Média</span>
                          <span role="columnheader">Ponderação</span>
                          <span role="columnheader">Texto</span>
                          <span role="columnheader">Exemplo</span>
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
                                type="text"
                                inputMode="decimal"
                                value={getWeightInputValue(template.id, template.weightPercentage)}
                                required
                                onFocus={(event) => event.currentTarget.select()}
                                onBlur={() => clearWeightInputDraft(template.id)}
                                onChange={(event) => updateWeightInputDraft(
                                  template.id,
                                  (value) =>
                                    updateEvaluationMomentTemplate(
                                      template.id,
                                      'weightPercentage',
                                      value,
                                    ),
                                  event.target.value,
                                )}
                              />
                            </label>
                            <label role="cell">
                              <span>Fundo</span>
                              <input
                                type="color"
                                value={template.backgroundColor}
                                onChange={(event) =>
                                  updateEvaluationMomentTemplate(
                                    template.id,
                                    'backgroundColor',
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label role="cell">
                              <span>Média</span>
                              <input
                                type="color"
                                value={template.averageBackgroundColor}
                                onChange={(event) =>
                                  updateEvaluationMomentTemplate(
                                    template.id,
                                    'averageBackgroundColor',
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label role="cell">
                              <span>Ponderação</span>
                              <input
                                type="color"
                                value={template.weightedBackgroundColor}
                                onChange={(event) =>
                                  updateEvaluationMomentTemplate(
                                    template.id,
                                    'weightedBackgroundColor',
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label role="cell">
                              <span>Texto</span>
                              <input
                                type="color"
                                value={template.textColor}
                                onChange={(event) =>
                                  updateEvaluationMomentTemplate(
                                    template.id,
                                    'textColor',
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <div className="settings-template-preview" role="cell">
                              <span
                                style={{
                                  backgroundColor: template.backgroundColor,
                                  color: template.textColor,
                                }}
                              >
                                Tipo
                              </span>
                              <span
                                style={{
                                  backgroundColor: template.averageBackgroundColor,
                                  color: template.textColor,
                                }}
                              >
                                Média
                              </span>
                              <span
                                style={{
                                  backgroundColor: template.weightedBackgroundColor,
                                  color: template.textColor,
                                }}
                              >
                                M*%
                              </span>
                            </div>
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
                  <section
                    className="settings-templates"
                    aria-label="Atitudes"
                  >
                    <div className="settings-templates-heading">
                      <div>
                        <h3>Atitudes</h3>
                        <p>
                          Define os textos, aliases, ponderações e cores usados nas atitudes.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={addAttitudeTemplate}
                      >
                        Adicionar atitude
                      </button>
                    </div>
                    {attitudeTemplates.length === 0 ? (
                      <p className="settings-templates-empty">
                        Ainda não existem atitudes configuradas.
                      </p>
                    ) : (
                      <div
                        className="settings-templates-table settings-attitudes-table"
                        role="table"
                        aria-label="Atitudes"
                      >
                        <div className="settings-templates-row settings-attitudes-row settings-templates-head" role="row">
                          <span role="columnheader">Texto</span>
                          <span role="columnheader">Alias</span>
                          <span role="columnheader">Ponderação (%)</span>
                          <span role="columnheader">Fundo</span>
                          <span role="columnheader">Ponderação</span>
                          <span role="columnheader">Texto</span>
                          <span role="columnheader">Exemplo</span>
                          <span role="columnheader">Ações</span>
                        </div>
                        {attitudeTemplates.map((template) => (
                          <div className="settings-templates-row settings-attitudes-row" role="row" key={template.id}>
                            <label role="cell">
                              <span>Texto</span>
                              <input
                                type="text"
                                value={template.text}
                                maxLength={100}
                                placeholder="Ex: Participação"
                                required
                                onChange={(event) =>
                                  updateAttitudeTemplate(
                                    template.id,
                                    'text',
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label role="cell">
                              <span>Alias</span>
                              <input
                                type="text"
                                value={template.alias}
                                maxLength={30}
                                placeholder="Ex: Part."
                                required
                                onChange={(event) =>
                                  updateAttitudeTemplate(
                                    template.id,
                                    'alias',
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label role="cell">
                              <span>Ponderação (%)</span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={getWeightInputValue(template.id, template.weightPercentage)}
                                required
                                onFocus={(event) => event.currentTarget.select()}
                                onBlur={() => clearWeightInputDraft(template.id)}
                                onChange={(event) => updateWeightInputDraft(
                                  template.id,
                                  (value) =>
                                    updateAttitudeTemplate(
                                      template.id,
                                      'weightPercentage',
                                      value,
                                    ),
                                  event.target.value,
                                )}
                              />
                            </label>
                            <label role="cell">
                              <span>Fundo</span>
                              <input
                                type="color"
                                value={template.backgroundColor}
                                onChange={(event) =>
                                  updateAttitudeTemplate(
                                    template.id,
                                    'backgroundColor',
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label role="cell">
                              <span>Ponderação</span>
                              <input
                                type="color"
                                value={template.weightedBackgroundColor}
                                onChange={(event) =>
                                  updateAttitudeTemplate(
                                    template.id,
                                    'weightedBackgroundColor',
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label role="cell">
                              <span>Texto</span>
                              <input
                                type="color"
                                value={template.textColor}
                                onChange={(event) =>
                                  updateAttitudeTemplate(
                                    template.id,
                                    'textColor',
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <div className="settings-template-preview" role="cell">
                              <span
                                style={{
                                  backgroundColor: template.backgroundColor,
                                  color: template.textColor,
                                }}
                              >
                                {template.alias || 'Alias'}
                              </span>
                              <span
                                style={{
                                  backgroundColor: template.weightedBackgroundColor,
                                  color: template.textColor,
                                }}
                              >
                                M*%
                              </span>
                            </div>
                            <div className="settings-template-actions" role="cell">
                              <button
                                type="button"
                                className="transparent-button"
                                onClick={() => removeAttitudeTemplate(template.id)}
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
                        <span role="columnheader">Nota</span>
                        <span role="columnheader">Fundo</span>
                        <span role="columnheader">Texto</span>
                        <span role="columnheader">Exemplo</span>
                      </div>
                      {percentageRanges.map((range) => (
                        <div className="settings-ranges-row" role="row" key={range.id}>
                          <label role="cell">
                            <span>Mín.</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={range.min}
                              onFocus={(event) => event.currentTarget.select()}
                              onChange={(event) => updatePercentageRange(range.id, 'min', normalizeIntegerInput(event.target.value))}
                            />
                          </label>
                          <label role="cell">
                            <span>Máx.</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={range.max}
                              onFocus={(event) => event.currentTarget.select()}
                              onChange={(event) => updatePercentageRange(range.id, 'max', normalizeIntegerInput(event.target.value))}
                            />
                          </label>
                          <label role="cell">
                            <span>Nota</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={range.nota}
                              onFocus={(event) => event.currentTarget.select()}
                              onChange={(event) => updatePercentageRange(range.id, 'nota', normalizeIntegerInput(event.target.value))}
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
                              {range.min}–{range.max}% (Nota {range.nota})
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
