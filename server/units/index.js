
const express = require('express')
const jwt = require('jsonwebtoken')

const database = require('../database')
const asyncWrap = require('../utils/async-wrap')
const unit = require('./unit')
const router = express.Router()

router.use('/unit', unit)

router.get('/', asyncWrap(async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET
  const auth = req.get('Authorization')

  try {
    if (!auth.match(/^(Bearer ([\w-]*\.[\w-]*\.[\w-]*))$/i)) throw new Error('Invalid token')

    const token = auth.split(' ')[1]
    jwt.verify(token, jwtSecret)
  } catch (error) {
    return res.json({
      success: false,
      message: 'Invalid token'
    })
  }

  const units = await database.query('SELECT * FROM `units`')
  res.json({
    success: true,
    message: 'No errors.',
    units
  })
}))

router.get('/filters', asyncWrap(async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET
  const auth = req.get('Authorization')

  try {
    if (!auth.match(/^(Bearer ([\w-]*\.[\w-]*\.[\w-]*))$/i)) throw new Error('Invalid token')

    const token = auth.split(' ')[1]
    jwt.verify(token, jwtSecret)
  } catch (error) {
    return res.json({
      success: false,
      message: 'Invalid token'
    })
  }

  const statuses = await database.query('SELECT DISTINCT `status` FROM `units`')

  res.json({
    success: true,
    message: 'No errors.',
    statuses: statuses.map(res => res.status.toUpperCase())
  })
}))

router.post('/', asyncWrap(async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET
  const auth = req.get('Authorization')
  let payload = null

  try {
    if (!auth.match(/^(Bearer ([\w-]*\.[\w-]*\.[\w-]*))$/i)) throw new Error('Invalid token')

    const token = auth.split(' ')[1]
    payload = jwt.verify(token, jwtSecret)
  } catch (error) {
    return res.json({
      success: false,
      message: 'Invalid token'
    })
  }

  const username = payload.username
  const department = req.body.department
  const area = req.body.area
  const status = req.body.status
  const quantity = req.body.quantity
  const maker = req.body.maker
  const fixed = req.body.fixed

  if (!department || !area || !status || !quantity || !maker || !fixed) {
    res.json({
      success: false,
      message: 'Invalid parameters'
    })
    return
  }

  const deptResults = await database.query('SELECT * FROM `departments` WHERE `id`=?', [department])
  if (deptResults.length === 0) {
    res.json({
      success: false,
      message: 'Invalid department ID'
    })
    return
  }

  const usersResults = await database.query('SELECT `id` FROM `accounts` WHERE `username`=?', [username])
  if (usersResults.length === 0) {
    res.json({
      success: false,
      message: 'Invalid user'
    })
    return
  }

  const userid = usersResults[0].id
  const cols = ['dept_id', 'area', 'maker', 'fixed', 'status', 'added_by']
  const colsStr = cols.map(col => `\`${col}\``).join(', ')
  const inserts = []
  const insert = (new Array(cols.length)).fill('?', 0, cols.length).join(', ')
  const inputs = []
  const input = [department, area, maker, fixed, status, userid]

  for (let i = 0; i < quantity; i++) {
    inserts.push('(' + insert + ')')
    inputs.push(...input)
  }

  const query = 'INSERT INTO `units` (' + colsStr + ') VALUES ' + inserts.join(', ')
  await database.query(query, inputs)

  res.json({
    success: true,
    message: 'No errors.'
  })
}))

module.exports = router
