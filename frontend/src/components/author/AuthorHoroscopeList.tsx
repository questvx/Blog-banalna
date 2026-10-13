import type { AdminHoroscopeWeek } from '../../api/adminHoroscopes'
import { getHoroscopeWeekDates, horoscopeSigns } from '../../api/adminHoroscopes'

type AuthorHoroscopeListProps = {
  weeks: string[]
  horoscopes: AdminHoroscopeWeek[]
  onEdit: (weekStart: string) => void
}

function AuthorHoroscopeList({ weeks, horoscopes, onEdit }: AuthorHoroscopeListProps) {
  const horoscopesByWeek = new Map(horoscopes.map((week) => [week.weekStart, week]))

  if (weeks.length === 0) {
    return <p className="author-dashboard-empty">Nie udało się przygotować listy tygodni.</p>
  }

  return (
    <div className="author-horoscope-list" role="list" aria-label="Horoskopy tygodniowe">
      {weeks.map((weekStart) => {
        const week = horoscopesByWeek.get(weekStart)
        const filledSigns = horoscopeSigns.filter(({ id }) => week?.signs[id]?.trim()).length
        const isComplete = filledSigns === horoscopeSigns.length

        return (
          <article className="author-horoscope-row" role="listitem" key={weekStart}>
            <div className="author-horoscope-info">
              <h2>{getHoroscopeWeekDates(weekStart)}</h2>
              <p>{week ? `${filledSigns} z ${horoscopeSigns.length} znaków uzupełnionych` : 'Nieuzupełniony'}</p>
            </div>
            <span className={`author-horoscope-status${isComplete ? ' is-complete' : ''}`}>
              {isComplete ? 'Gotowy' : 'Do uzupełnienia'}
            </span>
            <button
              className="author-horoscope-edit"
              type="button"
              onClick={() => onEdit(weekStart)}
            >
              Edytuj
            </button>
          </article>
        )
      })}
    </div>
  )
}

export default AuthorHoroscopeList
