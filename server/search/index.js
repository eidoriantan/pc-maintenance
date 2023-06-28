
const express = require('express')
const jwt = require('jsonwebtoken')

const database = require('../database')
const asyncWrap = require('../utils/async-wrap')
const router = express.Router()

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

  const department = req.query.department
  const area = req.query.area
  const status = req.query.status
  const removed = req.query.removed

  const conditions = []
  const values = []
  if (department) {
    conditions.push('`dept_id`=?')
    values.push(department)
  }

  if (area) {
    conditions.push('`area` LIKE ?')
    values.push(`%${area}%`)
  }

  if (status) {
    conditions.push('`status`=?')
    values.push(status)
  }

  if (removed !== '') {
    conditions.push('`removed`=?')
    values.push(removed)
  }

  const baseQuery = 'SELECT `units`.*,`departments`.`name` AS `dept_name` FROM `units` JOIN `departments` ON `departments`.`id`=`units`.`dept_id`'
  const query = baseQuery + (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '')
  const results = await database.query(query, values)
  res.json({
    success: true,
    message: 'No errors.',
    results
  })
}))

module.exports = router
