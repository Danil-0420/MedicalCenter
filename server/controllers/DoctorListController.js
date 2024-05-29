const uuid = require('uuid')
const path = require('path')
const {DoctorList, Doctor_info, Specialization, DocSpec, Department} = require('../models/models')
const ApiError = require('../error/ApiError')
const {rows} = require("pg/lib/defaults");

class DoctorListController{


    async create(req, res, next){
        try{
            let {fullName, info, specializationId} = req.body
            const {img} = req.files

            let fileName = uuid.v4() + '.jpg'
            img.mv(path.resolve(__dirname, '..', 'static', fileName))

            const doctor = await DoctorList.create({fullName, img: fileName})


            if(info){
                info = JSON.parse(info)
                info.forEach(i=>{
                    Doctor_info.create({
                        title: i.title,
                        description: i.description,
                        doctorListId: doctor.id
                    })
                })
            }

            const specDoc = await DocSpec.create({specializationId, doctorListId: doctor.id})

            return res.json(doctor)
        }
        catch (e){
            next(ApiError.badRequest(e.message))
        }
    }



    async getAll(req, res) {
        let { departmentId, specializationId, page, limit } = req.query;
        let doctor={count: 0, rows: []}
        page = page || 1;
        limit = limit || 40;
        let offset = page * limit - limit;


        if (!departmentId && !specializationId) {
            doctor = await DoctorList.findAndCountAll({
                include: [
                    {model: DocSpec, include: [
                            {model: Specialization, include:[
                                    {model: Department}
                                ]}
                        ]}
                ],
                limit, offset });
        }
        else if (departmentId && !specializationId) {
            let rows = await DoctorList.findAll({
                include: [{
                    model: DocSpec,
                    include: [{
                        model: Specialization,
                        where: { departmentId: departmentId },
                        include: [
                            {model: Department}
                        ]
                    }]
                }],
                limit,
                offset,
            });
            doctor.count=rows.length
            doctor.rows=rows
        }
        else if (!departmentId && specializationId) {
            doctor = await DoctorList.findAndCountAll({
                include: { model: DocSpec, where:{specializationId: specializationId},
                include: [
                    {model: Specialization, include:[
                            {model: Department}
                        ]}
                ]
                },
                limit,
                offset,
            });
        } else {
            let rows = await DoctorList.findAll({
                include: [
                    {
                        model: DocSpec,
                        include: {
                            model: Specialization,
                            where: { departmentId: departmentId, id: specializationId },
                            include: [
                                {model: Department}
                            ]
                        }
                    }
                ],
                limit,
                offset,
            });
            doctor.count=rows.length
            doctor.rows=rows
        }

        return res.json(doctor);
    }




    async getOne(req, res){
        const {id} = req.params
        const doctor = await DoctorList.findOne({
            where: {id},
            include: [
                {model: Doctor_info, as: 'info'},
                {model: DocSpec, include: [
                        {model: Specialization, include:[
                                {model: Department}
                            ]}
                    ]}
            ]
        })
        return res.json(doctor)
    }



    async delete(req, res) {
        const { id } = req.params;
        try {
            const doctor = await DoctorList.findByPk(id);
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }
            await doctor.destroy();
            return res.json({ message: 'Doctor has been deleted' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error deleting doctor' });
        }
    }


    async update(req, res, next) {
        try {
            // Получить ID доктора из URL-адреса запроса
            const id = req.params.id;

            // Найти доктора в базе данных по ID
            const doctor = await DoctorList.findByPk(id);

            // Проверить, существует ли доктор в базе данных
            if (!doctor) {
                return res.status(404).json({ message: 'Доктор не найден' });
            }

            // Извлечь новые данные доктора из тела запроса
            let { fullName, info, rating, specializationId, departmentId } = req.body;


            // Обновить остальные поля доктора
            if (fullName) {
                await doctor.update({ fullName });
            }
            if (rating) {
                await doctor.update({ rating });
            }
            // info = JSON.parse(req.body.info);
            // Обновить информацию о докторе, если она была изменена
            if (info) {
                // info = JSON.parse(info);
                await Doctor_info.destroy({ where: { doctorListId: id } });
                info.forEach(async i => {
                    await Doctor_info.create({
                        title: i.title,
                        description: i.description,
                        doctorListId: id,
                    });
                });
            }

            if (departmentId) {
                // Найти специализацию, к которой относится доктор
                const specialization = await Specialization.findOne({ where: { id: specializationId } });
                if (!specialization) {
                    return res.status(404).json({ message: 'Специализация не найдена' });
                }
                // Найти отделение, к которому относится специализация
                const department = await Department.findOne({ where: { id: specialization.department_id } });
                if (!department) {
                    return res.status(404).json({ message: 'Отделение не найдено' });
                }
                // Проверить, что отделение, к которому относится доктор, соответствует отделению специализации
                if (department.id !== departmentId) {
                    return res.status(400).json({ message: 'Отделение, к которому относится доктор, не соответствует указанному отделению' });
                }
                // Обновить связь между отделением и доктором
                await DoctorList.update({ department_id: departmentId }, { where: { id } });
            }


            const updatedDoctor = await DoctorList.findByPk(id, {
                include: [{
                    model: Doctor_info,
                    attributes: ['title', 'description'],
                    as: 'info'
                }]
            });
            return res.json(updatedDoctor);

        } catch (e) {
            // Обработать ошибки, если они возникают
            console.error(e);
            next(ApiError.badRequest(e.message));
        }
    }


}
module.exports = new DoctorListController()