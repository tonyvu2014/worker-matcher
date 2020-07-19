const jobService = require('./jobService')
const axios = require('axios')

jest.mock('axios')

describe("getJobs()", () => {
    it("should fetch jobs", async () => {
        const jobs = [{guid: '1x2y3z'}, {guid: '7a8b9c'}]
        const response = { data: jobs }
        axios.get.mockResolvedValue(response);

        const actualJobs = await jobService.getJobs()

        expect(actualJobs).toEqual(jobs)
    })
})

describe("isWorkersRequired()", () => {
    it("should return true for job with workerRequired which is 1", () => {
        const job = {
            workersRequired: 1
        }
        expect(jobService.isWorkersRequired(job)).toEqual(true);
    })

    it("should return true for job with workerRequired which is more than 1", () => {
        const job = {
            workersRequired: 99
        }
        expect(jobService.isWorkersRequired(job)).toEqual(true);
    })

    it("should return false for job with workerRequired which is 0", () => {
        const job = {
            workersRequired: 0
        }
        expect(jobService.isWorkersRequired(job)).toEqual(false);
    })
})

describe("isJobStartDateValid()", () => {
    it("should return false for job with startDate which is in the past", () => {
        let yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const job = {
            startDate: yesterday.toString()
        }
        expect(jobService.isJobStartDateValid(job)).toEqual(false);
    })

    it("should return true for job with startDate which is in the future", () => {
        let tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const job = {
            startDate: tomorrow.toString()
        }
        expect(jobService.isJobStartDateValid(job)).toEqual(true);
    })
})

describe("isJobActive()", () => {
    it("should return false given that isWorkersRequired() is false", () => {
        const job = {test: '123'}
        jobService.isWorkersRequired = jest.fn(() => false)
        expect(jobService.isJobActive(job)).toEqual(false);
    })

    it("should return true given that isWorkersRequired() is true", () => {
        const job = {test: '123'}
        jobService.isWorkersRequired = jest.fn(() => true)
        expect(jobService.isJobActive(job)).toEqual(true);
    })
})

describe("hasValidDriverLicense()", () => {
    it("should return true for worker who has driver license", () => {
        const worker = {hasDriversLicense: true}
        const job = {test: 'abc'}
        expect(jobService.hasValidDriverLicense(worker, job)).toEqual(true);
    })

    it("should return true when worker has no driver license and job does not require driver license", () => {
        const worker = {hasDriversLicense: false}
        const job = {driverLicenseRequired: false}
        expect(jobService.hasValidDriverLicense(worker, job)).toEqual(true);
    })

    it("should return false when worker has no driver license and job requires driver license", () => {
        const worker = {hasDriversLicense: false}
        const job = {driverLicenseRequired: true}
        expect(jobService.hasValidDriverLicense(worker, job)).toEqual(false);
    })
})

describe("hasRequiredCertificates()", () => {
    it("should return true when job requires no certificates", () => {
        const worker = {test: 'xyz'}
        const job = {noRequiredCertificates: {}}
        expect(jobService.hasRequiredCertificates(worker, job)).toEqual(true);
    })

    it("should return true when worker has all required certificates by the job", () => {
        const worker = {"certificates": ["Outstanding Innovator", "The Behind the Scenes Wonder", "The Risk Taker"]}
        const job = {requiredCertificates: ["Outstanding Innovator", "The Risk Taker"]}
        expect(jobService.hasRequiredCertificates(worker, job)).toEqual(true);
    })

    it("should return false when worker does not have at least 1 certificate which is required by the job", () => {
        const worker = {"certificates": ["Outstanding Innovator", "The Behind the Scenes Wonder", "The Risk Taker"]}
        const job = {requiredCertificates: ["Outstanding Innovator", "The Risk Taker", "Excellence in Organization"]}
        expect(jobService.hasRequiredCertificates(worker, job)).toEqual(false);
    })
})

describe("matchLocation()", () => {
    it("should return true when job has no location", () => {
        const worker = {test: 'xyz'}
        const job = {noLocation: {}}
        expect(jobService.matchLocation(worker, job)).toEqual(true);
    })

    it("should return true when worker has no job search address", () => {
        const worker = {noJobSearchAddress: {'longitude': 12.43325, 'latitude': 34.93757, 'maxJobDistance': 30, unit: 'km'}}
        const job = {test: 'anything'}
        expect(jobService.matchLocation(worker, job)).toEqual(true);
    })

    it("should return true when distanct to job is less than max job distance", () => {
        const worker = {jobSearchAddress: {'longitude': 12.43325, 'latitude': 34.93757, 'maxJobDistance': 30, unit: 'km'}}
        const job = {location: {'longitude': 12.43627, 'latitude': 34.80379}}
        expect(jobService.matchLocation(worker, job)).toEqual(true);
    })

    it("should return false when distanct to job is more than max job distance", () => {
        const worker = {jobSearchAddress: {'longitude': 12.43325, 'latitude': 34.93757, 'maxJobDistance': 30, unit: 'km'}}
        const job = {location: {'longitude': 19.03627, 'latitude': 46.80379}}   
        expect(jobService.matchLocation(worker, job)).toEqual(false);
    })
})


describe("matchJob()", () => {
    it("should return false when job is not active", () => {
        const worker = {guid: 'worker'}
        const job = {guid: 'job'}
        jobService.isJobActive = jest.fn(() => false)
        expect(jobService.matchJob(worker, job)).toEqual(false);
    })

    it("should return true when worker has valid driver license, required certificates match job locatio", () => {
        const worker = {guid: 'worker'}
        const job = {guid: 'job'}
        jobService.isJobActive = jest.fn(() => true)
        jobService.hasValidDriverLicense = jest.fn(() => true)
        jobService.hasRequiredCertificates = jest.fn(() => true)
        jobService.matchLocation = jest.fn(() => true)
        expect(jobService.matchJob(worker, job)).toEqual(true);
    })

    it("should return false when worker has no valid driver license", () => {
        const worker = {guid: 'worker'}
        const job = {guid: 'job'}
        jobService.isJobActive = jest.fn(() => true)
        jobService.hasValidDriverLicense = jest.fn(() => false)
        jobService.hasRequiredCertificates = jest.fn(() => true)
        jobService.matchLocation = jest.fn(() => true)
        expect(jobService.matchJob(worker, job)).toEqual(false);
    })

    it("should return false when worker does not have required certificates", () => {
        const worker = {guid: 'worker'}
        const job = {guid: 'job'}
        jobService.isJobActive = jest.fn(() => true)
        jobService.hasValidDriverLicense = jest.fn(() => true)
        jobService.hasRequiredCertificates = jest.fn(() => false)
        jobService.matchLocation = jest.fn(() => true)
        expect(jobService.matchJob(worker, job)).toEqual(false);
    })

    it("should return false when worker's job search address does not match job location", () => {
        const worker = {guid: 'worker'}
        const job = {guid: 'job'}
        jobService.isJobActive = jest.fn(() => true)
        jobService.hasValidDriverLicense = jest.fn(() => true)
        jobService.hasRequiredCertificates = jest.fn(() => true)
        jobService.matchLocation = jest.fn(() => false)
        expect(jobService.matchJob(worker, job)).toEqual(false);
    })

})

