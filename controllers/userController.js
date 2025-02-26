const bcrypt = require("bcryptjs");
const JWT = require('jsonwebtoken');
const { validationResult } = require("express-validator");

const db = require('../models');
const user = db.User;

class UserController {

    //User Registration
    static async registerUser( req,res ) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password, role } = req.body;

            //Check existing user
            const existingUser = await user.findOne({
                where: { email}
            });

            if(existingUser) {
                return res.status(400).json({
                    message: "Email already registered"
                })
            }

            //hashing
            const hashedPassword = await bcrypt.hash(password, 10);

            //create new user
            const newUser = await user.create({
                email,
                password: hashedPassword,
                role: role || 'customer' 
            });

            return res.status(201).json({
                message: "User Registered successfully",
                userData: newUser
            })
        } catch (error) {
            console.log("Error while registering", error);
            return res.status(500).json({ message: "Internal server error"})
        }
    }

    //user Login
    static async userLogin (req, res ) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        try {
            
            const { email, password } = req.body;

            const users = await user.findOne({
                where: { 
                    email
                }
            });

            if(!users) {
                return res.status(401).json({
                    message: "Email not found"
                })
            }

            const isPasswordValid = await bcrypt.compare(password, users.password);

            if(!isPasswordValid) {
                return res.status(401).json({
                    message: "Invalid Password or email"
                })
            }

            //Token generate
            const token = JWT.sign({
                id: users.id, email: users.email, role: users.role
            }, process.env.JWT_SECRET_KEY, {expiresIn: "1h"});

            //Role-based access
            let accessMessage = "";
            if(users.role === "admin") {
                accessMessage = "Admin access granted";
            }
            else {
                accessMessage = "Customer access granted";
            }

            return res.status(200).json({
                message: "Login Successful",
                userData: {
                    id: users.id,
                    email: users.email,
                    role: users.role
                },
                Token : token,
                access : accessMessage
            })
        } catch (error) {
            console.log("Error during login", error);
            return res.status(500).json({
                message:"Internal server error"
            })
        }
    }

    static async getallUsers (req, res ) {

        try {
            
            const users = await user.findAll({
                attributes: [
                    "id",
                    "email",
                    "role",
                    "createdAt",
                    "updatedAt"
                ]
            });

            return res.status(200).json({
                message: "Users retrieved successfully",
                users
            });

        } catch (error) {
            console.log("Error fetching users", error);
            return res.status(500).json({
                message: "Internal server error"
            })
        }
    }

    static async userProfile (req, res) {

        try {
            
            const { id } = req.params;

            const userDetails = await user.findOne({
                where: {id},
                attributes: [
                    "id",
                    "email",
                    "role",
                    "createdAt",
                    "updatedAt"
                ]
            });

            if(!userDetails) {
                return res.status(404).json({
                    message: "User not found"
                })
            }

            return res.status(200).json({
                message: "User details retrieved successfully",
                user: userDetails
            })
        } catch (error) {
            console.log("Error while fetching user", error);
            return res.status(500).json({
                message: "Internal server error"
            })
        }
    }
}


module.exports = UserController