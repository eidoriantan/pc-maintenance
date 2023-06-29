
const fs = require('fs')
const path = require('path')
const express = require('express')
const { Paragraph, patchDocument, PatchType, Table, TableCell, TableRow, VerticalAlign } = require('docx')

const database = require('../database')
const formatDate = require('../utils/format-date')
const asyncWrap = require('../utils/async-wrap')
const router = express.Router()

const dataPath = path.resolve(__dirname, '../../data')
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath)

router.get('/', asyncWrap(async (req, res) => {
  const unitId = req.query.id

  const units = await database.query('SELECT `units`.*,`departments`.`name` AS `dept_name`,`colleges`.`dean` FROM `units` JOIN `departments` ON `departments`.`id`=`units`.`dept_id` JOIN `colleges` ON `colleges`.`id`=`departments`.`college` WHERE `units`.`id`=?', [unitId])
  if (units.length === 0) {
    res.json({
      success: false,
      message: 'No unit found'
    })
    return
  }

  const unit = units[0]
  const now = new Date()
  const firstDay = formatDate(now)
  const firstDate = new Date(firstDay.replace(/([0-9]{2},)/, '01'))

  const operations = await database.query('SELECT * FROM `operations` WHERE `unit_id`=? AND `date_end` BETWEEN ? AND NOW()', [unit.id, firstDate])
  const actionTaken = []
  const tools = []
  const remarks = []
  let personnel = ''
  let incharge = ''

  if (typeof operations[0] !== 'undefined') {
    personnel = operations[0].personnel
    incharge = operations[0].incharge
  }

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i]
    actionTaken.push(operation.description)
    tools.push(operation.tools)
    remarks.push(operation.remarks)
  }

  const monthlyDocx = path.resolve(__dirname, '../files/monthly.docx')
  const docx = await fs.promises.readFile(monthlyDocx)
  const patched = await patchDocument(docx, {
    patches: {
      date: {
        type: PatchType.DOCUMENT,
        children: [new Paragraph(now.toString())]
      },
      control_no: {
        type: PatchType.DOCUMENT,
        children: [new Paragraph(unit.id.toString())]
      },
      department: {
        type: PatchType.DOCUMENT,
        children: [new Paragraph(unit.dept_name)]
      },
      area: {
        type: PatchType.DOCUMENT,
        children: [new Paragraph(unit.area)]
      },
      name: {
        type: PatchType.DOCUMENT,
        children: [new Paragraph(`PC Unit #${unit.id.toString()}`)]
      },
      action_taken: {
        type: PatchType.DOCUMENT,
        children: [new Paragraph(actionTaken.join('\r\n'))]
      },
      tools: {
        type: PatchType.DOCUMENT,
        children: [new Paragraph(tools.join('\r\n'))]
      },
      remarks: {
        type: PatchType.DOCUMENT,
        children: [new Paragraph(remarks.join('\r\n'))]
      },
      personnel: {
        type: PatchType.DOCUMENT,
        children: [new Paragraph(personnel)]
      },
      incharge: {
        type: PatchType.DOCUMENT,
        children: [new Paragraph(incharge)]
      },
      dean: {
        type: PatchType.DOCUMENT,
        children: [new Paragraph(unit.dean)]
      }
    }
  })

  const filename = Math.floor(Date.now() / 1000).toString() + '.docx'
  const tempPath = path.resolve(dataPath, filename)
  await fs.promises.writeFile(tempPath, patched)

  res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  res.sendFile(tempPath)
}))

module.exports = router
