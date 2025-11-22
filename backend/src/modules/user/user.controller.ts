import type { Request, Response } from "express";
import * as userService from './user.service.js';

export const getUsers = async (req : Request, res: Response) => {
    try {
        const users = await userService.getUsers();
        return res.json({ok: true, data: users});
    } catch (err) {
        console.error("Get users error: ", err);
        return res.status(500).json({ ok: false, error: "Failed to get users" });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        if (!id) {
            return res.status(400).json({ ok: false, error: "User ID is required" });
        }
        const updatedUser = await userService.updateUser(parseInt(id), updateData);
        return res.json({ ok: true, data: updatedUser });
    } catch (err) {
        console.error("Update user error: ", err);
        return res.status(500).json({ ok: false, error: "Failed to update user" });
    }
}

export const addUser = async (req : Request, res : Response) => {
    const userData = req.body;
    try {
        if (!userData) {
            return res.status(400).json({ ok : false, error: "User data is required"});
        }
        const addUser = await userService.addUser(userData);
        return res.json({ ok: true, data: addUser});
    } catch(error) {
        console.error("Add user error: ", error);
        return res.status(500).json({ ok: false, error: "Failed to add user"});
    }
}
