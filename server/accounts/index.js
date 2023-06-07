
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const database = require('../database')
const asyncWrap = require('../utils/async-wrap')
const router = express.Router()

router.get('/', asyncWrap(async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET
  const auth = req.get('Authorization')
  const username = req.query.username

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

  const results = await database.query('SELECT id,username,added FROM accounts WHERE username LIKE ?', [`%${username}%`])
  res.json({
    success: true,
    message: '',
    results
  })
}))

router.post('/', asyncWrap(async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET
  const auth = req.get('Authorization')
  const username = req.body.username
  const password = req.body.password

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

  const users = await database.query('SELECT * FROM accounts WHERE username=?', [username])
  if (users.length > 0) {
    return res.json({
      success: false,
      message: 'Username already exists'
    })
  }

  const hashed = await bcrypt.hash(password, 10)
  await database.query('INSERT INTO accounts (username, password) VALUES (?, ?)', [username, hashed])

  res.json({
    success: true,
    message: ''
  })
}))

router.delete('/:id', asyncWrap(async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET
  const auth = req.get('Authorization')
  const id = req.params.id

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

  await database.query('DELETE FROM accounts WHERE id=?', [id])
  res.json({
    success: true,
    message: ''
  })
}))

router.post('/login', asyncWrap(async (req, res) => {
  const adminUser = process.env.ADMIN_USER
  const adminPass = process.env.ADMIN_PASS
  const jwtSecret = process.env.JWT_SECRET
  const username = req.body.username
  const password = req.body.password

  const genToken = (type) => jwt.sign({ username, type }, jwtSecret, {
    expiresIn: '24h'
  })

  if (username === adminUser && password === adminPass) {
    return res.json({
      success: true,
      message: '',
      token: genToken('admin')
    })
  }

  const users = await database.query('SELECT * FROM accounts WHERE username=?', [username])
  if (users.length === 0) {
    return res.json({
      success: false,
      message: 'No account found',
      token: null
    })
  }

  const user = users[0]
  const match = await bcrypt.compare(password, user.password)
  if (match) {
    res.json({
      success: true,
      message: '',
      token: genToken('user')
    })
  } else {
    res.json({
      success: false,
      message: 'Invalid password'
    })
  }
}))

module.exports = router
