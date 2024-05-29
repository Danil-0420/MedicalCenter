const {Department, Specialization} = require('../models/models')
const sequelize = require('../db');

class DepartmentController{
    async create(req, res, next){
    const {name} = req.body
        const department = await Department.create({name})
        return res.json(department)
    }

    async getAll(req, res){
        const departments = await Department.findAll()
        return res.json(departments)
    }

    // async delete(req, res) {
    //     const { id } = req.params;
    //
    //     const transaction = await sequelize.transaction();
    //
    //     try {
    //         // Находим департамент и все связанные с ним специализации
    //         const department = await Department.findByPk(id, {
    //             include: [{ model: Specialization }],
    //         });
    //
    //         if (!department) {
    //             return res.status(404).json({ message: 'Department not found' });
    //         }
    //
    //         // Удаляем все специализации, связанные с департаментом
    //         const specializations = department.specializations;
    //         for (let i = 0; i < specializations.length; i++) {
    //             const specialization = specializations[i];
    //             await specialization.destroy({ transaction });
    //         }
    //
    //         // Удаляем департамент
    //         await department.destroy({ transaction });
    //
    //         // Если всё прошло успешно, коммитим транзакцию
    //         await transaction.commit();
    //
    //         return res.json({ message: 'Department and all related specializations have been deleted' });
    //     } catch (error) {
    //         // Если возникла ошибка, откатываем транзакцию
    //         await transaction.rollback();
    //         console.error(error);
    //         return res.status(500).json({ message: 'Error deleting department' });
    //     }
    // }


}
module.exports = new DepartmentController()