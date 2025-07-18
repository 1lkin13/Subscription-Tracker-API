import User from '../models/user.model.js';

export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find()
        return res.status(200).json({
                success: true,
                data: users
            }
        )
    } catch (err) {
        next(err)
    }
}

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password')
        console.log("user",user)
        if (!user) {
            const error = new Error('User Not Found')
            error.status = 404
            throw error
        }
        return res.status(200).json({
                success: true,
                data: user
            }
        )
    } catch (error) {
        next(error)
    }
}


