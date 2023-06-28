
const express = require('express')
const jwt = require('jsonwebtoken')

const database = require('../database')
const asyncWrap = require('../utils/async-wrap')
const router = express.Router()

router.get('/:id', asyncWrap(async (req, res) => {
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

  const unitId = req.params.id
  const query = 'SELECT `units`.*,`departments`.`name` AS `dept_name` FROM `units` JOIN `departments` ON `departments`.`id`=`units`.`dept_id` WHERE `units`.`id`=?'
  const units = await database.query(query, [unitId])
  res.json({
    success: true,
    message: 'No errors.',
    unit: units[0]
  })
}))

router.delete('/:id', asyncWrap(async (req, res) => {
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

  const unitId = req.params.id
  await database.query('UPDATE `units` SET `removed`=1 WHERE id=?', [unitId])
  const query = 'INSERT INTO `operations` (`unit_id`, `operation`, `description`, `date_start`, `date_end`) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
  await database.query(query, [unitId, 4, ''])

  res.json({
    success: true,
    message: 'No errors.'
  })
}))

router.post('/:id', asyncWrap(async (req, res) => {
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

  const unitId = req.params.id
  const department = req.body.department
  const area = req.body.area
  const status = req.body.status

  if (!department || !area || !status) {
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

  const unitsResults = await database.query('SELECT * FROM `units` WHERE `id`=?', [unitId])
  if (unitsResults.length === 0) {
    res.json({
      success: false,
      mesage: 'Invalid unit ID'
    })
    return
  }

  const unit = unitsResults[0]
  const sets = []
  const values = []

  if (unit.dept_id.toString() !== department) {
    sets.push('`dept_id`=?')
    values.push(department)
  }

  if (unit.area !== area) {
    sets.push('`area`=?')
    values.push(area)
  }

  if (unit.status !== status) {
    sets.push('`status`=?')
    values.push(status)
  }

  if (sets.length === 0) {
    res.json({
      success: false,
      message: 'Nothing to change'
    })
    return
  }

  values.push(unitId)
  const query = 'UPDATE `units` SET ' + sets.join(', ') + ' WHERE `id`=?'
  await database.query(query, values)

  res.json({
    success: true,
    message: 'No errors.'
  })
}))

router.get('/:id/operations', asyncWrap(async (req, res) => {
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

  const unitId = req.params.id
  const order = req.query.order

  const orderSql = order === 'asc' ? '' : ' ORDER BY `date_end` DESC'
  const units = await database.query('SELECT `units`.*,`departments`.`name` AS `dept_name` FROM `units` JOIN `departments` ON `departments`.`id`=`units`.`dept_id` WHERE `units`.`id`=?', [unitId])
  if (units.length === 0) {
    res.json({
      success: false,
      message: 'Unit does not exist'
    })
    return
  }

  const unit = units[0]
  const operations = await database.query('SELECT * FROM `operations` WHERE `unit_id`=?' + orderSql, [unitId])
  const encodedOperation = {
    id: 0,
    unit_id: unitId,
    department: unit.dept_name,
    area: unit.area,
    operation: 0,
    description: 'Unit was added to database.',
    date_start: unit.date_encoded,
    date_end: unit.date_encoded
  }

  res.json({
    success: true,
    message: 'No errors.',
    operations: [...operations, encodedOperation]
  })
}))

module.exports = router
