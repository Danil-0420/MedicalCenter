const {Schedule, DoctorList, DocSpec, Specialization, Appointment, User} = require("../models/models");



class ScheduleController {
    async create(req, res) {
        try {
            const { doctorListId, location, schedules } = req.body;

            // Проверяем, существует ли доктор с указанным doctorListId
            const doctor = await DoctorList.findOne({ id: doctorListId });
            if (!doctor) {
                return res.status(404).json({ error: 'Доктор не найден' });
            }

            // Проверяем, что указано хотя бы одно расписание
            if (!schedules || schedules.length === 0) {
                return res.status(400).json({ error: 'Не указаны расписания' });
            }

            // Создаем расписания
            const createdSchedules = await Promise.all(
                schedules.map(async (schedule) => {
                    const { workDay, startWork, endWork } = schedule;
                    const createdSchedule = await Schedule.create({
                        doctorListId,
                        location,
                        workDay,
                        startWork,
                        endWork,
                    });
                    return createdSchedule;
                })
            );

            res.status(201).json({ message: 'Расписания успешно созданы', schedules: createdSchedules });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Произошла ошибка сервера' });
        }
    }



    async update(req, res) {
        try {
            const { doctorId } = req.params;
            console.log(doctorId)
            const { index, workDay, startWork, endWork, location} = req.body;
            const schedules = await Schedule.findAll({
                where: { doctorListId: doctorId },
                include: [
                    {
                        model: DoctorList,
                        attributes: ['fullName']
                    }
                ]
            });


            if (!schedules || index >= schedules.length) {
                return res.status(404).json({ error: 'Расписание не найдено' });
            }


            const scheduleToUpdate = schedules[index];
            scheduleToUpdate.workDay = workDay;
            scheduleToUpdate.startWork = startWork;
            scheduleToUpdate.endWork = endWork;
            scheduleToUpdate.location = location;

            const updatedSchedule = await scheduleToUpdate.save();

            res.status(200).json({ message: 'Расписание успешно обновлено', schedule: updatedSchedule });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Произошла ошибка сервера' });
        }
    }



    async getByDoctor(req, res) {
        try {
            const { doctorId } = req.params;
            const schedules = await Schedule.findAll({
                where: { doctorListId: doctorId },
                include: [
                    {
                        model: DoctorList,
                        attributes: ['fullName']
                    }
                ]
            });
            res.status(200).json({ schedules });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Произошла ошибка сервера' });
        }
    }

}
module.exports = new ScheduleController()
