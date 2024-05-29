const {DocSpec, Specialization, Department} = require('../models/models')

class DocSpecController{
    async create(req, res){
        const {specializationId, doctorListId} = req.body
        const specDoc = await DocSpec.create({specializationId, doctorListId})
        return res.json(specDoc)
    }

    async getAll(req, res) {
        const specDoc = await Department.findAll()
        return res.json(specDoc)
    }

}
module.exports = new DocSpecController()