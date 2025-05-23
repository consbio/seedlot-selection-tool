import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { t, c, jt } from 'ttag'
import Constraint from './Constraint'
import EditableLabel from '../components/EditableLabel'
import { updateConstraintValues } from '../actions/constraints'

const monthNames = [
  c('January').t`Jan`,
  c('February').t`Feb`,
  c('March (month)').t`Mar`,
  c('April (month)').t`Apr`,
  c('May (month)').t`May`,
  c('June').t`Jun`,
  c('July').t`Jul`,
  c('August').t`Aug`,
  c('September').t`Sep`,
  c('October').t`Oct`,
  c('November').t`Nov`,
  c('December').t`Dec`,
]

const getJulianDay = (year: number, month: number, day: number) => {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  const julianDate =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045

  return julianDate - 2451545 + 0.0008
}

const daylight = (year: number, month: number, day: number, lat: number, lon: number) => {
  const radians = (degrees: number) => (degrees * Math.PI) / 180
  const degrees = (radiansIn: number) => (radiansIn * 180) / Math.PI

  const julianDay = getJulianDay(year, month, day)
  const solarNoon = julianDay - lon / 360
  const solarAnomaly = (357.5291 + 0.98560028 * solarNoon) % 360
  const equationOfCenter =
    1.9148 * Math.sin(radians(solarAnomaly)) +
    0.02 * Math.sin(radians(2 * solarAnomaly)) +
    0.0003 * Math.sin(radians(3 * solarAnomaly))
  const eclipticLongitude = (solarAnomaly + equationOfCenter + 180 + 102.9372) % 360
  const solarTransit =
    2451545.5 + solarNoon + 0.0053 * Math.sin(radians(solarAnomaly)) - 0.0069 * Math.sin(radians(2 * eclipticLongitude))
  const declination = Math.asin(Math.sin(radians(eclipticLongitude)) * Math.sin(radians(23.44)))
  const hourAngle = Math.acos(
    (Math.sin(radians(-0.83)) - Math.sin(radians(lat)) * Math.sin(declination)) /
      (Math.cos(radians(lat)) * Math.cos(declination)),
  )
  const sunrise = solarTransit - degrees(hourAngle) / 360
  const sunset = solarTransit + degrees(hourAngle) / 360

  return (sunset - sunrise) * 24
}

const connector = connect(
  ({ runConfiguration }: { runConfiguration: any }, { values }: { values: any }) => {
    let { hours } = values
    const { year, month, day } = values
    const { x, y } = runConfiguration.point

    if (hours !== null) {
      hours = hours.toFixed(1)
    }

    let value = '--'
    if (x !== '' && y !== '') {
      const numberOfHours = daylight(year, month, day, y, x).toFixed(1)
      value = jt`${numberOfHours} hours` as string
    }

    return { value, hours, month, day }
  },
  dispatch => ({
    onHoursChange: (index: any, hours: string) => {
      const value = parseFloat(hours)

      if (!Number.isNaN(value)) {
        dispatch(updateConstraintValues(index, { hours: value }))
      }
    },

    onMonthChange: (index: number, month: string) => {
      dispatch(updateConstraintValues(index, { month: parseInt(month, 10) + 1 }))
    },

    onDayChange: (index: number, day: string) => {
      dispatch(updateConstraintValues(index, { day: parseInt(day, 10) }))
    },
  }),
)

type PhotoperiodConstraintProps = ConnectedProps<typeof connector> & {
  index: number
}

const PhotoperiodConstraint = ({
  index,
  value,
  hours,
  month,
  day,
  onHoursChange,
  onMonthChange,
  onDayChange,
}: PhotoperiodConstraintProps) => {
  const daysInMonth = 32 - new Date(1961, month - 1, 32).getDate()
  const dayOptions = Array.from(Array(daysInMonth).keys())

  return (
    <Constraint index={index} value={value} title={t`Photoperiod`} className="photoperiod-constraint">
      <div>
        <div>
          <EditableLabel value={hours} onChange={hoursValue => onHoursChange(index, hoursValue)}>
            &nbsp;{t`hours`}
          </EditableLabel>
        </div>
        <div className="photoperiod-date">
          <div className="select is-inline-block is-small">
            <select
              className="photoperiod-month"
              value={month - 1}
              onChange={e => {
                e.preventDefault()
                onMonthChange(index, e.target.value)
              }}
            >
              {monthNames.map((name, i) => {
                return (
                  <option key={name} value={i}>
                    {name}
                  </option>
                )
              })}
            </select>
          </div>
          <span>&nbsp;</span>
          <div className="select is-inline-block is-small">
            <select
              className="form form-control form-inline photoperiod-day"
              value={day}
              onChange={e => {
                e.preventDefault()
                onDayChange(index, e.target.value)
              }}
            >
              {dayOptions.map(dayNumber => {
                return (
                  <option key={dayNumber} value={dayNumber + 1}>
                    {dayNumber + 1}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      </div>
    </Constraint>
  )
}

export default connector(PhotoperiodConstraint)
