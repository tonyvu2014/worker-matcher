const workerService = require('./workerService')
const axios = require('axios')

jest.mock('axios')

describe("getWorker()", () => {
    it("should fetch correct worker by id", async () => {
        const worker1 = {guid: 'worker1', rating: 2}
        const worker2 = {guid: 'worker2', rating: 5}
        const workers = [worker1, worker2]
        const response = { data: workers }
        axios.get.mockResolvedValue(response);

        const actualWorker = await workerService.getWorker('worker1')

        expect(actualWorker).toEqual(worker1)
    })
})