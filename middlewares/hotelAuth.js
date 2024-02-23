const jwt = require('jsonwebtoken');
const hotelModel = require('../models/hotelModel');

const hotelAuth = async (req, res, next) => {
    try {
        // pass the token the token
        const auth = req.headers.authorization;
        if (!auth) {
            return res.status(404).json({
                message: 'oops! user logged out. Please login to continue'
            });
        }
        // split the token
        const token = auth.split(' ')[1];
        if (!token) {
            return res.status(404).json({
                message: 'oops! user logged out. Please login to continue'
            });
        }

        // encrypt the package
        const decodeToken = jwt.verify(token, process.env.jwtKey);

        // find the user
        const user = await hotelModel.findById(decodeToken.hotelId);
        if (!user) {
            return res.status(404).json({
                message: 'oops! user logged out. Please login to continue'
            });
        }

        // check if the user is loged out
        if(user.hotelBlacklist.includes(token)){
            return res.status(403).json({
                message: 'oops! user logged out. Please login to continue'
            })
        }

        req.user = decodeToken;

        next();
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: 'Session Timeout'
            });
        }

        res.status(500).json({
            message: err.message
        });
    }
};

module.exports = hotelAuth;
