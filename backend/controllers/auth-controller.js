class AuthController {
    sendOtp(req, res) {
        //Logic
        const { phone } = req.body;
        if (!phone) {
            res.status(400).json({ message: 'Phone Field is required!' })
        }



        res.send('Hello from Otp')

    }
}

module.exports = new AuthController();