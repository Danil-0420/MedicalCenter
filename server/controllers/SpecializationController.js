const {Specialization, DoctorList} = require('../models/models')

class SpecializationController{
    async create(req, res){
        const {name, departmentId} = req.body
        const specialization = await Specialization.create({name, departmentId})
        return res.json(specialization)
    }


    async getAll(req, res) {
        let { departmentId } = req.query;
        let specializations;

        if (!departmentId || departmentId === 0) {
            specializations = await Specialization.findAll({ where: { departmentId:0 } })
        }
         else {
            specializations = await Specialization.findAll({ where: { departmentId } });
        }

        return res.json(specializations);
    }



    async delete(req, res) {
        const { id } = req.params;

        try {
            const specialization = await Specialization.findByPk(id);
            if (!specialization) {
                return res.status(404).json({ message: 'Specialization not found' });
            }
            await specialization.destroy();
            return res.json({ message: 'Specialization has been deleted' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error deleting specialization' });
        }
    }



}
module.exports = new SpecializationController()