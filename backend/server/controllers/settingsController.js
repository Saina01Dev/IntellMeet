import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        if (req.body.settings) {
            user.settings = {
                muteMicOnJoin: req.body.settings.muteMicOnJoin !== undefined ? req.body.settings.muteMicOnJoin : user.settings?.muteMicOnJoin,
                disableCameraOnJoin: req.body.settings.disableCameraOnJoin !== undefined ? req.body.settings.disableCameraOnJoin : user.settings?.disableCameraOnJoin,
            };
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            settings: updatedUser.settings,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
