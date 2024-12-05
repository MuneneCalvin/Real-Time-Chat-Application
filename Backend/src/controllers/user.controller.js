const { userService } = require('../services');


const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getUsersDropdown();
        res.send(users);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const updateUseById = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.send(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const deleteUserById = async (req, res) => {
    try {
        const user = await userService.deleteUser(req.params.id);
        res.send(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
};


module.exports = {
    getAllUsers,
    updateUseById,
    deleteUserById
};