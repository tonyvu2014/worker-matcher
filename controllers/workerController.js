const AppError = require('../utils/appError');
const workerService = require('../service/workerService')
const jobService = require('../service/jobService')

const MAX_MATCHED_JOB = 3

exports.findMatchedJobs = async (req, res, next) => {
    const id = req.params.id

    try {
        const worker = await workerService.getWorker(id)
        if (!worker) {
            return next(new AppError(404, 'fail', `No worker found with id ${id}`), req, res, next)
        }

        if (!worker.isActive) {
            return next(new AppError(404, 'fail', 'Worker is not active'), req, res, next)
        }

        const jobs = await jobService.getJobs()
        const matchedJobs = []
        let matchedJobCount = 0
        for (const job of jobs) {
            if (jobService.matchJob(worker, job)) {
                matchedJobs.push(job)
                matchedJobCount++
                if (matchedJobCount >= MAX_MATCHED_JOB) {
                    break
                }
            }
        }

        res.status(200).json({
            status: 'success',
            data: matchedJobs
        })
    } catch (err) {
        next(err)
    }   

}