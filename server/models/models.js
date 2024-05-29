const sequelize = require('../db')
const {DataTypes} = require('sequelize')


const User = sequelize.define('user', {
    id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    fullName:{type: DataTypes.STRING, allowNull: true},
    email:{type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING, allowNull: false},
    phoneNumber: {type: DataTypes.STRING, allowNull: true},
    birthday: {type: DataTypes.STRING, allowNull: true},
    img:{type: DataTypes.STRING, allowNull: true},
    role: {type: DataTypes.STRING, defaultValue: 'USER'}
})


const Department = sequelize.define('department', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
})

const Specialization = sequelize.define('specialization', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
})


const Doctor_info = sequelize.define('doctor_info', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.TEXT, allowNull: false},
    description: {type: DataTypes.TEXT, allowNull: false},
})

const Schedule = sequelize.define('schedule', {
    id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    location: {type: DataTypes.STRING, allowNull: true},
    workDay:{type:DataTypes.STRING, allowNull: true},
    startWork: {type: DataTypes.TIME, allowNull: true},
    endWork: {type: DataTypes.TIME, allowNull: true}
})

const DocSpec = sequelize.define('doctor_specialization', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
})

const DoctorList = sequelize.define('doctorList', {
    id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    fullName:{type: DataTypes.STRING, allowNull: false},
    img:{type: DataTypes.STRING, allowNull: false},
    rating:{type:DataTypes.INTEGER, defaultValue: 0}
})


const Appointment = sequelize.define('appointment', {
    id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    date:{type:DataTypes.DATE, allowNull: false},
    statusName: {type:DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false}
})

const Diagnosis = sequelize.define('diagnosis', {
    id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name:{type:DataTypes.STRING, allowNull: true},
    description: {type: DataTypes.STRING, allowNull: true},
    date:{type:DataTypes.DATE, allowNull: true}
})

const Prescription = sequelize.define('prescription', {
    id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    medication :{type:DataTypes.STRING, allowNull: true},
    dosage :{type:DataTypes.STRING, allowNull: true},
    description: {type: DataTypes.STRING, allowNull: true}
})


User.hasMany(Appointment)
Appointment.belongsTo(User)

DoctorList.hasMany(Doctor_info, {as: 'info'})
Doctor_info.belongsTo(DoctorList)

DoctorList.hasMany(Schedule)
Schedule.belongsTo(DoctorList)

Specialization.hasMany(DocSpec)
DocSpec.belongsTo(Specialization)

DoctorList.hasMany(DocSpec)
DocSpec.belongsTo(DoctorList)

Department.hasMany(Specialization)
Specialization.belongsTo(Department)

DoctorList.hasMany(Appointment)
Appointment.belongsTo(DoctorList)

Appointment.hasMany(Diagnosis)
Diagnosis.belongsTo(Appointment)

Diagnosis.hasMany(Prescription)
Prescription.belongsTo(Diagnosis)


module.exports = {
    User,
    Doctor_info,
    Schedule,
    Department,
    Specialization,
    DoctorList,
    Appointment,
    DocSpec,
    Diagnosis,
    Prescription
}

