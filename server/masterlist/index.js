
const fs = require('fs')
const path = require('path')
const express = require('express')
const {
  Paragraph,
  patchDocument,
  PatchType,
  Table,
  TableCell,
  TableRow,
  VerticalAlign
} = require('docx')

const database = require('../database')
const formatDate = require('../utils/format-date')
const asyncWrap = require('../utils/async-wrap')
const router = express.Router()

const dataPath = path.resolve(__dirname, '../../data')
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath)

router.get('/', asyncWrap(async (req, res) => {
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

  const masterlistDocx = path.resolve(__dirname, '../files/masterlist.docx')
  const docx = await fs.promises.readFile(masterlistDocx)
  const rows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('CONTROL NO.')],
          verticalAlign: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph('NAME OF MACHINE/EQUIPMENT')],
          verticalAlign: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph('DATE ACQUIRED')],
          verticalAlign: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph('MAKER/SUPPLIER')],
          verticalAlign: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph('FIXED ASSET')],
          verticalAlign: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph('LOCATION')],
          verticalAlign: VerticalAlign.CENTER
        })
      ]
    })
  ]

  for (let i = 0; i < results.length; i++) {
    const unit = results[i]
    rows.push(new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph(unit.id.toString())],
          verticalAlign: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph('PC Unit #' + unit.id.toString())],
          verticalAlign: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph(formatDate(unit.date_encoded))],
          verticalAlign: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph(unit.maker)],
          verticalAlign: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph(unit.fixed)],
          verticalAlign: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph(unit.area)],
          verticalAlign: VerticalAlign.CENTER
        })
      ]
    }))
  }

  const patched = await patchDocument(docx, {
    patches: {
      table: {
        type: PatchType.DOCUMENT,
        children: [
          new Table({ rows })
        ]
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
