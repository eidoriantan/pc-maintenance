
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

  const colleges = await database.query('SELECT * FROM `colleges`')
  res.json({
    success: true,
    message: 'No errors.',
    colleges
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

  const college = req.body.college
  const abbr = req.body.abbr
  const dean = req.body.dean
  const colleges = await database.query('SELECT * FROM `colleges` WHERE `abbr`=?', [abbr])
  if (colleges.length > 0) {
    return res.json({
      success: false,
      message: 'College abbr already exists'
    })
  }

  await database.query('INSERT INTO `colleges` (`name`, `abbr`, `dean`) VALUES (?, ?, ?)', [college, abbr, dean])
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
  await database.query('DELETE FROM `colleges` WHERE `id`=?', [id])
  res.json({
    success: true,
    message: 'No errors.'
  })
}))

module.exports = router
