
const mysql = require('mysql')

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
})

connection.connect(error => {
  if (error) {
    console.error(error)
    process.exit(1)
  }

  console.log('Connected to MySQL Server')
})

async function query (stmt, values) {
  return new Promise((resolve, reject) => {
    connection.query(stmt, values, (error, results, fields) => {
      if (error) {
        console.error(error)
        return reject(error)
      }

      resolve(results)
    })
  })
}

module.exports = { query }
