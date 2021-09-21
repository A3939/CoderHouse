const otpService = require('../services/otp-service')
const hashService = require('../services/hash-service')


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
        try{

            await otpService.sendBySms(phone,otp);
            res.json({
                hash: `${hash}.${expires}`,
                phone,
            })
        }catch(err){
            console.log(err)
            res.status(500).json({message: 'message sending failed'})
        }


        res.json({ hash: hash})

    }
}

module.exports = new AuthController();