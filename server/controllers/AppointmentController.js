const {Appointment, User, DoctorList, Diagnosis, Prescription, DocSpec, Specialization, Schedule} = require("../models/models");
const moment = require('moment');
const {Op} = require("sequelize");

class AppointmentController{
    async create(req, res) {
        try {
            const { name, email, phoneNumber, date, doctorListId, description } = req.body;

            // Проверка наличия пользователя в базе данных по email или создание нового пользователя
            const [user, created] = await User.findOrCreate({
                where: { email },
                defaults: { fullName: name, phoneNumber },
            });

            // Преобразование даты в формат, который можно использовать в запросе к базе данных
            const formattedDate = moment(date).format('YYYY-MM-DD');

            // Получение информации о рабочем дне доктора из таблицы "Schedule"
            const dateObj = new Date(formattedDate);
            const dayOfWeek = dateObj.getDay();
            const daysOfWeek = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четверг', 'Пятниця', 'Субота'];
            const workDay = daysOfWeek[dayOfWeek];
            const schedule = await Schedule.findOne({ where: { doctorListId, workDay } });

            if (!schedule) {
                return res.status(400).json({ message: 'Доктор не работает в выбранный день' });
            }


            const startWork = moment(schedule.startWork, 'HH:mm:ss').format('HH:mm:ss');
            const endWork = moment(schedule.endWork, 'HH:mm:ss').format('HH:mm:ss');

            const appointmentDate = new Date(date);
            const hours = appointmentDate.getHours().toString().padStart(2, '0');
            const minutes = appointmentDate.getMinutes().toString().padStart(2, '0');
            const time = `${hours}:${minutes}`;

            // Проверка попадания даты в диапазон рабочего времени
            if (time <= startWork || time >= endWork) {
                return res.status(400).json({ message: 'Выбранная дата не попадает в диапазон рабочего времени доктора' });
            }

            const fullTime=`${formattedDate}T${time}`


            // Проверка уже существующих записей и диапазона времени
            const existingAppointment = await Appointment.findAll({ where: { doctorListId, date: fullTime} });
            console.log(existingAppointment.length)
            const existingAppointments = await Appointment.findAll({ where: { doctorListId, date: { [Op.gt]: '2023-05-15'}} });


            if (existingAppointment.length > 0) {
                let possibleTimes = [];
                let existingAppointmentsHours = existingAppointments.map(appointment => new Date(appointment.date).getHours());
                let existingAppointmentsMinutes = existingAppointments.map(appointment => new Date(appointment.date).getMinutes());
                let takenTimes = existingAppointmentsHours.map((hour, index) => `${hour}:${existingAppointmentsMinutes[index].toString().padStart(2, '0')}`);
                console.log(takenTimes)

                const startWorkObj = moment(schedule.startWork, 'HH:mm:ss');
                const endWorkObj = moment(schedule.endWork, 'HH:mm:ss');

                // Предложение другого свободного времени
                for (let i = startWorkObj.hours(); i < endWorkObj.hours(); i++) {
                    if (i < 10) {
                        possibleTimes.push(`0${i}:00`);
                        // possibleTimes.push(`0${i}:45`);
                    } else {
                        possibleTimes.push(`${i}:00`);
                        // possibleTimes.push(`${i}:45`);
                    }
                }


                const freeTimes = possibleTimes.filter(time => !takenTimes.includes(time));

                if (freeTimes.length === 0) {
                    return res.status(400).json({ message: 'Существуют записи на все доступные для приема времена' });
                }
                return res.status(400).json({ message: `Выбранное время уже занято, доступные свободные времена: ${freeTimes.join(', ')}` });
            }
// Создание новой записи на прием к врачу
            const appointment = await Appointment.create({
                userId: user.id,
                doctorListId,
                date: moment(`${formattedDate} ${time}`, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
                description,
                statusName: 'в обробці'
            });
            const diagnosis = await Diagnosis.create({
                appointmentId: appointment.id
            });

            const prescription = await Prescription.create({
                diagnosisId: diagnosis.id
            });

            return res.json({ appointment, diagnosis, prescription });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }



    async getByType(req, res) {
        const { type } = req.params;
        try {
            let appointments;
            const { id, role } = req.user;
            switch (type) {
                case 'ADMIN':
                    if (role !== 'ADMIN') {
                        return res.status(401).json({ message: 'Unauthorized' });
                    }
                    appointments = await Appointment.findAll({
                        attributes: { exclude: ['description'] },
                        include: [
                            {
                                model: User,
                                attributes: ['id', 'fullName', 'phoneNumber', 'email']
                            },
                            {
                                model: DoctorList,
                                attributes: ['id', 'fullName']
                            }
                        ]
                    });
                    return res.json({ appointments });

                case 'USER':
                    if (role !== 'USER') {
                        console.log(id)
                        console.log(role)
                        return res.status(401).json({ message: 'Unauthorized' });
                    }
                    appointments = await Appointment.findAll({
                        where: { userId: id },
                        include: [
                            {
                                model: User,
                                attributes: ['id', 'fullName', 'phoneNumber', 'email']
                            },
                            {
                                model: DoctorList,
                                attributes: ['id', 'fullName']
                            }
                        ]
                    });

                    return res.json({ appointments });

                case 'DOCTOR':
                    if (role !== 'DOCTOR') {
                        return res.status(401).json({ message: 'Unauthorized' });
                    }
                    const { docName } = req.query;
                    const doctor = await DoctorList.findOne({
                        where: { fullName: docName }
                    });
                    console.log(docName)
                    if (!doctor) {
                        return res.status(400).json({ message: 'Doctor not found' });
                    }
                    appointments = await Appointment.findAll({
                        where: { doctorListId: doctor.id },
                        include: [
                            {
                                model: User,
                                attributes: ['id', 'fullName', 'phoneNumber', 'email']
                            },
                            {
                                model: DoctorList,
                                attributes: ['id', 'fullName']
                            }
                        ]
                    });
                    return res.json({ appointments });

                default:
                    return res.status(400).json({ message: 'Invalid type' });
            }
        } catch (e) {
            console.log(e);
            res.status(400).json({ message: `Error getting appointments for type ${type}` });
        }
    }



    async getOne(req, res) {
        const { id } = req.params;

        try {
            const appointment = await Appointment.findByPk(id, {
                include: [
                    {
                        model: User,
                        attributes: ['id', 'fullName', 'phoneNumber', 'email']
                    },
                    {
                        model: DoctorList,
                        attributes: ['id', 'fullName']
                    },
                    {
                        model: Diagnosis,
                        attributes: ['id', 'name', 'description'],
                        include: {
                            model: Prescription,
                            attributes: ['id', 'medication', 'dosage', 'description']
                        }
                    }
                ]
            });

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            return res.json({ appointment });
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }


    async updateAppointment(req, res, next) {
        const { id } = req.params;
        const { statusName, name, description, medication, dosage, descriptionPr, date, userId, doctorList } = req.body;
        const { role } = req.user;

        try {
            const appointment = await Appointment.findOne({ where: { id },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'fullName', 'phoneNumber', 'email']
                    },
                    {
                        model: DoctorList,
                        attributes: ['id', 'fullName']
                    }
                ]});

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            let diagnosis, prescription;

            if (role === 'DOCTOR') {
                diagnosis = await Diagnosis.findOne({
                    where: { appointmentId: appointment.id }
                });

                prescription = await Prescription.findOne({
                    where: { diagnosisId: diagnosis.id }
                });

                if(name){
                    diagnosis.name = name
                }

                if (description) {
                    diagnosis.description = description;
                }
                if (medication) {
                    prescription.medication = medication;
                }
                if (dosage) {
                    prescription.dosage = dosage;
                }
                if (descriptionPr) {
                    prescription.description = descriptionPr;
                }
            }

            if (role === 'ADMIN' || role === 'DOCTOR') {
                if (statusName) {
                    appointment.statusName = statusName;
                }

            } else {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Check if any fields were updated
            const isUpdated = appointment.changed() || (diagnosis && diagnosis.changed()) || (prescription && prescription.changed());
            if (isUpdated) {
                await appointment.save();

                if (role === 'DOCTOR') {
                    await diagnosis.save();
                    await prescription.save();
                }
            }

            // Return appointment information
            return res.json(appointment);
        } catch (error) {
            return next(error);
        }
    }


}
module.exports = new AppointmentController()