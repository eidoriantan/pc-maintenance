
function fill (str, n, space = '0') {
  while (str.length < n) {
    str = space + str
  }

  return str
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

module.exports = function formatDate (date) {
  const year = date.getFullYear().toString()
  const month = MONTHS[date.getMonth()]
  const day = fill(date.getDate().toString(), 2)

  return month + ' ' + day + ', ' + year
}
