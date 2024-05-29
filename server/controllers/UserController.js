const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, DoctorList} = require('../models/models')
const uuid = require("uuid");
const path = require("path");
const jwt_Decode = require('jwt-decode')
const fs = require('fs');

// const defaultImg = require('../static/0f65cbfb-5205-4a79-b578-72420da0837a.jpg')

// const generateJwtToken = (id, fullName, email, role)=>{
//     return jwt.sign(
//         {id, fullName ,email, role},
//         process.env.SECRET_KEY,
//         {expiresIn: '24h'}
//     )
// }

const generateJwtToken = (id, fullName, email, role, phoneNumber, birthday) => {
    return jwt.sign(
        { id, fullName, email, role, phoneNumber, birthday },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    );
};


class UserController{
    // async registration(req, res, next){
    //     const {fullName, email, password, phoneNumber, role} = req.body
    //
    //     if(!email || !password){
    //         return next(ApiError.badRequest('write your mail and password'))
    //     }
    //     const candidate = await User.findOne({where: {email}})
    //     if(candidate){
    //         return next(ApiError.badRequest('this email is already used'))
    //     }
    //     const {img} = req.files
    //
    //     let fileName = uuid.v4() + '.jpg'
    //     img.mv(path.resolve(__dirname, '..', 'static', fileName))
    //
    //     const hashPass = await bcrypt.hash(password, 5)
    //     const user = await  User.create({fullName, email, password: hashPass, phoneNumber, img: fileName, role})
    //     const token = generateJwtToken(user.id, user.fullName, user.email, user.role)
    //
    //     return res.json({token})
    // }
    // async login(req, res, next){
    //     const {email, password} = req.body
    //     const user = await User.findOne({where: {email}})
    //     if(!user){
    //         return next(ApiError.internal('no such user'))
    //     }
    //     const comparePass = bcrypt.compareSync(password, user.password)
    //     if(!comparePass){
    //         return next(ApiError.badRequest('Incorrect password'))
    //     }
    //     const token = generateJwtToken(user.id, user.fullName, user.email, user.role)
    //     return res.json({token})
    // }
    //
    //
    // async check(req, res){
    //     const token = generateJwtToken(req.user.id, req.user.email, req.user.role)
    //     return res.json({token})
    // }

    async registration(req, res, next) {
        const { fullName, email, password, phoneNumber, birthday, role } = req.body;

        if (!email || !password) {
            return next(ApiError.badRequest('write your mail and password'));
        }

        const candidate = await User.findOne({ where: { email } });

        if (candidate) {
            return next(ApiError.badRequest('this email is already used'));
        }
        //
        // const { img } = req.files;
        // const fileName = uuid.v4() + '.jpg';
        // img.mv(path.resolve(__dirname, '..', 'static', fileName));

        const fileName = 'default/44bb3d0f-507e-44cb-9533-acbfae31fd48.jpg';

        // console.log(defaultImg)
        const hashPass = await bcrypt.hash(password, 5);
        const user = await User.create({ fullName, email, password: hashPass, phoneNumber, img: fileName, role });

        const token = generateJwtToken(user.id, user.fullName, user.email, user.role, user.phoneNumber, user.birthday);

        return res.json({ token });
    }


    async login(req, res, next) {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return next(ApiError.internal('no such user'));
        }

        const comparePass = bcrypt.compareSync(password, user.password);

        if (!comparePass) {
            return next(ApiError.badRequest('Incorrect password'));
        }

        const token = generateJwtToken(user.id, user.fullName, user.email, user.role, user.phoneNumber, user.birthday);

        return res.json({ token });
    }

    async check(req, res) {
        const { id, email, role, fullName, phoneNumber, birthday } = req.user;
        const token = generateJwtToken(id, fullName, email, role, phoneNumber, birthday);
        console.log(req.user)
        return res.json({ token });
    }


    async getUserById(req, res){
        try {
            const {id} = req.params
            const user = await User.findOne({where: {id}})
            return res.json(user)
        } catch (e) {
            res.status(500).json({message: "Что-то пошло не так, попробуйте снова"})
        }
    }

    async updateUserInfo(req, res, next) {
        const {fullName, email, password, phoneNumber, birthday} = req.body;
        const userId = req.user.id;
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return next(ApiError.notFound('User not found'));
            }

            if (email && email !== user.email) {
                const candidate = await User.findOne({where: {email}});
                if (candidate) {
                    return next(ApiError.badRequest('Email is already taken'));
                }
                user.email = email;
            }

            if (fullName) {
                user.fullName = fullName;
            }

            if (password) {
                const hashPass = await bcrypt.hash(password, 5);
                user.password = hashPass;
            }

            if (phoneNumber) {
                user.phoneNumber = phoneNumber;
            }
            if(birthday){
                user.birthday = birthday
            }

            if (req.files && req.files.img) {
                const { img } = req.files;
                const fileName = uuid.v4() + '.jpg';

                // Удаляем предыдущее изображение профиля, если оно существует
                // if (user.img) {
                //     const filePath = path.resolve(__dirname, '..', 'static', user.img);
                //     fs.unlinkSync(filePath);
                // }

                img.mv(path.resolve(__dirname, '..', 'static', fileName));
                user.img = fileName;
            }

            await user.save();

            const token = generateJwtToken(user.id, user.email, user.role);
            return res.json({token});
        } catch (error) {
            console.error(error);
            return next(ApiError.internal('Internal server error'));
        }
    }
}

module.exports = new UserController()

