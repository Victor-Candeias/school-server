import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'
import { normalizeDecimalInput } from '../../utils/validation'

type EvaluationQuestionFormProps = {
  model: SchoolApplicationModel
}

export function EvaluationQuestionForm({ model }: EvaluationQuestionFormProps) {
  const {
    handleSaveEvaluationQuestion,
    newEvaluationQuestion,
    updateNewEvaluationQuestion,
  } = model

  return (
    <form onSubmit={handleSaveEvaluationQuestion}>
                    <label>
                      N.º da questão
                      <input
                        type="text"
                        value={newEvaluationQuestion.questionNumber}
                        onChange={(event) =>
                          updateNewEvaluationQuestion('questionNumber', event.target.value)
                        }
                        placeholder="Ex: 1"
                        autoFocus
                        required
                      />
                    </label>
                    <label>
                      Valor da questão
                      <input
                        type="text"
                        inputMode="decimal"
                        value={newEvaluationQuestion.value}
                        onFocus={(event) => event.currentTarget.select()}
                        onChange={(event) =>
                          updateNewEvaluationQuestion('value', normalizeDecimalInput(event.target.value))
                        }
                        placeholder="Ex: 5"
                        required
                      />
                    </label>
                    <button type="submit">Gravar questão</button>
                  </form>
  )
}
