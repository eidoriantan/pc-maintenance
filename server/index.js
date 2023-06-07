
const path = require('path')
const express = require('express')

const envPath = path.resolve(__dirname, '..', '.env')
require('dotenv').config({ path: envPath })

const accounts = require('./accounts')
const departments = require('./departments')
const units = require('./units')
const operations = require('./operations')
const search = require('./search')

const app = express()
const port = process.env.PORT || 3001
const appBuild = path.resolve(__dirname, '../build')

app.use(express.static(appBuild))
app.use(express.json())

app.use('/api/accounts', accounts)
app.use('/api/departments', departments)
app.use('/api/units', units)
app.use('/api/operations', operations)
app.use('/api/search', search)

app.use((err, req, res, next) => {
  console.error(err)
  res.json({
    success: false,
    message: err.message
  })
})

app.use('*', (req, res) => {
  const indexPath = path.resolve(__dirname, '../build/index.html')
  res.sendFile(indexPath)
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})
