
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

function formatDate (date) {
  const year = date.getFullYear().toString()
  const month = MONTHS[date.getMonth()]
  const day = fill(date.getDate().toString(), 2)

  return month + ' ' + day + ', ' + year
}

function formatDateSQL (date) {
  const year = date.getFullYear().toString()
  const month = fill((date.getMonth() + 1).toString(), 2)
  const day = fill(date.getDate().toString(), 2)

  return year + '-' + month + '-' + day + ' 00:00:00'
}

module.exports = formatDate

module.exports.formatDateSQL = formatDateSQL
