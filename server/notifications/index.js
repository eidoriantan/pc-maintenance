
const express = require('express')
const jwt = require('jsonwebtoken')

const database = require('../database')
const asyncWrap = require('../utils/async-wrap')
const router = express.Router()

router.get('/', asyncWrap(async (req, res) => {
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

  if (payload.type === 'admin') {
    res.json({
      success: true,
      message: '',
      notifications: []
    })
    return
  }

  const users = await database.query('SELECT * FROM `accounts` WHERE `username`=?', [payload.username])
  if (users.length === 0) {
    res.json({
      success: false,
      message: 'User not found'
    })
    return
  }

  const user = users[0]
  const query = 'SELECT `units`.*, `departments`.`name` AS `dept_name`, `departments`.`abbr` AS `dept_abbr` FROM `units`' +
    ' JOIN `departments` ON `departments`.`id` = `units`.`dept_id`' +
    ' WHERE `units`.`added_by`=?'
  const units = await database.query(query, [user.id])
  const notifications = []
  const daysNotify = parseInt(process.env.DAYS_NOTIFY) * 24 * 60 * 60 * 1000

  for (let i = 0; i < units.length; i++) {
    const unit = units[i]
    const operations = await database.query('SELECT * FROM `operations` WHERE `unit_id`=? ORDER BY `date_end` DESC', [unit.id])
    const time = Date.now()
    const cleans = []
    const updates = []

    for (let j = 0; j < operations.length; j++) {
      const operation = operations[j]
      if (operation.operation === 1) cleans.push(operation)
      if (operation.operation === 3) updates.push(operation)
    }

    const encodedDate = new Date(unit.date_encoded)
    const encoded = encodedDate.getTime()
    if (time - encoded <= daysNotify) continue

    const latestCleanDate = new Date(cleans.length > 0 ? cleans[0].date_end : unit.date_encoded)
    const latestClean = latestCleanDate.getTime()
    if (time - latestClean > daysNotify) {
      notifications.push({
        unitId: unit.id,
        title: `Unit #${unit.id} needs cleaning!`,
        details: `Unit #${unit.id} of department "${unit.dept_name} (${unit.dept_abbr})" needs cleaning`
      })
    }

    const latestUpdateDate = new Date(updates.length > 0 ? updates[0].date_end : unit.date_encoded)
    const latestUpdate = latestUpdateDate.getTime()
    if (time - latestUpdate > daysNotify) {
      notifications.push({
        unitId: unit.id,
        title: `Unit #${unit.id} needs updating!`,
        details: `Unit #${unit.id} of department "${unit.dept_name} (${unit.dept_abbr})" needs updating`
      })
    }
  }

  res.json({
    success: true,
    message: '',
    notifications
  })
}))

module.exports = router
