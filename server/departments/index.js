
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

  const departments = await database.query('SELECT `departments`.*, `colleges`.`name` AS `college_name` FROM `departments` JOIN `colleges` ON `colleges`.`id` = `departments`.`college`')
  res.json({
    success: true,
    message: 'No errors.',
    departments
  })
}))

router.post('/', asyncWrap(async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET
  const auth = req.get('Authorization')

  try {
    if (!auth.match(/^(Bearer ([\w-]*\.[\w-]*\.[\w-]*))$/i)) throw new Error('Invalid token')

    const token = auth.split(' ')[1]
    const payload = jwt.verify(token, jwtSecret)
    if (payload.type !== 'admin') throw new Error('User is not admin')
  } catch (error) {
    return res.json({
      success: false,
      message: 'Invalid token'
    })
  }

  const department = req.body.department
  const college = req.body.college
  const abbr = req.body.abbr
  const departments = await database.query('SELECT * FROM `departments` WHERE `abbr`=?', [abbr])
  if (departments.length > 0) {
    return res.json({
      success: false,
      message: 'Department abbr already exists'
    })
  }

  await database.query('INSERT INTO `departments` (`name`, `college`, `abbr`) VALUES (?, ?, ?)', [department, college, abbr])
  res.json({
    success: true,
    message: 'No errors.'
  })
}))

router.delete('/:id', asyncWrap(async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET
  const auth = req.get('Authorization')

  try {
    if (!auth.match(/^(Bearer ([\w-]*\.[\w-]*\.[\w-]*))$/i)) throw new Error('Invalid token')

    const token = auth.split(' ')[1]
    const payload = jwt.verify(token, jwtSecret)
    if (payload.type !== 'admin') throw new Error('User is not admin')
  } catch (error) {
    return res.json({
      success: false,
      message: 'Invalid token'
    })
  }

  const id = req.params.id
  await database.query('DELETE FROM `departments` WHERE `id`=?', [id])
  res.json({
    success: true,
    message: 'No errors.'
  })
}))

module.exports = router
