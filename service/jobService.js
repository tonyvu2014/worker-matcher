const helpers = require('../utils/helpers')
const axios = require('axios')

const api_base_url = process.env.API_BASE_URL || 'http://test.swipejobs.com/api'
const GET_JOBS_API = `${api_base_url}/jobs`

exports.getJobs = async () => {
    try {
        const response = await axios.get(GET_JOBS_API)
        const jobs = response.data
        return jobs
    } catch (error) {
        console.log(error)
    }
}

exports.isWorkersRequired = job => {
    return job.workersRequired >=1 
}


exports.isJobStartDateValid = job => {
    const startDate = new Date(job.startDate)

    const current = new Date()

    return startDate >= current
}


exports.isJobActive = job => {
    return this.isWorkersRequired(job) 
        // && isJobStartDateValid(job)
}

exports.hasValidDriverLicense = (worker, job) => {
    if (worker.hasDriversLicense) {
        return true
    }

    return !job.driverLicenseRequired
}

exports.hasRequiredCertificates = (worker, job) => {
    const { requiredCertificates } = job
    const workerCertificates = worker.certificates

    if (!requiredCertificates) {
        return true
    }

    return requiredCertificates.every(c => workerCertificates.indexOf(c) > -1)
}

exports.matchLocation = (worker, job) => {
    const jobLocation = job.location
    if (!jobLocation) {
        return true
    }

    const { jobSearchAddress } = worker
    if (!jobSearchAddress) {
        return true
    }

    const jobLocationLat = parseFloat(jobLocation.latitude)
    const jobLocationLon = parseFloat(jobLocation.longitude)

    const jobSearchAddressLat = parseFloat(jobSearchAddress.latitude)
    const jobSearchAddressLon = parseFloat(jobSearchAddress.longitude)

    const { unit, maxJobDistance } = jobSearchAddress

    const distanceToJob = helpers.computeDistance(jobLocationLat, jobLocationLon, jobSearchAddressLat, jobSearchAddressLon, unit)

    return distanceToJob <= maxJobDistance
}

exports.matchJob = (worker, job) => {
    if (!this.isJobActive(job)) {
        return false
    }

    return this.hasValidDriverLicense(worker,job) 
        && this.hasRequiredCertificates(worker, job) 
        && this.matchLocation(worker, job)
}