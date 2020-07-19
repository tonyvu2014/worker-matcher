const express = require('express')
const workerController = require('../controllers/workerController')

const router = express.Router()

router.get('/:id/matchedJobs', workerController.findMatchedJobs)

module.exports = router