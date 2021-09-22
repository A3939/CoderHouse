const otpService = require('../services/otp-service')
const hashService = require('../services/hash-service')
const userService = require('../services/user-service')
const tokenService = require('../services/token-service')
class AuthController {
    async sendOtp(req, res) {
        //Logic
        const { phone } = req.body;
        if (!phone) {
            res.status(400).json({ message: 'Phone Field is required!' })
        }

        const otp = await otpService.generateOtp();

        //Hash
        const ttl = 1000 * 60 * 2; //2 min
        const expires = Date.now() + ttl;
        const data = `${phone}.${otp}.${expires}`;
        const hash = hashService.hashOtp(data);

        //send otp
        try {

            await otpService.sendBySms(phone, otp);
            res.json({
                hash: `${hash}.${expires}`,
                phone,
            })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'message sending failed' })
        }


        res.json({ hash: hash })

    }
    async verifyOtp(req, res) {
        const { otp, hash, phone } = req.body;
        if (!otp || !hash || !phone) {
            res.status(400).json({ message: 'All fields are required!' })

        }

        const [hashedOtp, expires] = hash.split('.');
        if (Date.now() > +expires) {
            res.status(400).json({ message: 'OTP expired!' })
        }

        const data = `${phone}.${otp}.${expires}`;
        const isValid = otpService.verifyOtp(hashedOtp, data)
        if (!isValid) {
            res.status(400).json({ message: 'OTP is invalid' })
        }

        let user;

        try {
            user = await userService.findUser({ phone })
            if (!user) {
                user = await userService.createUser({ phone })
            }

        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'DB Error' })
        }

        //Token
        const { accessToken, refreshToken } = tokenService.generateTokens({
            _id: user._id, 
            acticated:false,
        })

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        })

        res.json({ accessToken })

    }
}

module.exports = new AuthController();