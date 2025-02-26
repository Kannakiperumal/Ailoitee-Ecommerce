const express = require("express");
const router = express.Router();

const { body, param } = require("express-validator");

const UserController = require("../controllers/userController");
const { authenticate, authorizeRole } = require("../middlewares/auth");


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with email, password, and role.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: "mypassword123"
 *               role:
 *                 type: string
 *                 enum: [admin, customer]
 *                 example: customer
 *     responses:
 *       201:
 *         description: User Registered successfully
 *       400:
 *         description: Email already registered
 *       500:
 *         description: Internal server error
 */
router.post("/register",
    [
        body("email").isEmail().withMessage("Invalid email format"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
        body("role")
            .isIn(["admin", "customer"])
            .withMessage("Role must be either 'admin' or 'customer'"),
    ],
    UserController.registerUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate a user using email and password.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     role:
 *                       type: string
 *                       example: customer
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1...
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */
router.post("/login",
    [
        body("email").isEmail().withMessage("Invalid email format"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    UserController.userLogin);

/**
 * @swagger
 * /users/admin-dashboard:
 *   get:
 *     summary: Admin Dashboard
 *     description: Access restricted to admins only.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []  # This must match the name in your swagger.js file
 *     responses:
 *       200:
 *         description: Welcome Admin!
 *       403:
 *         description: Access Denied. Insufficient permissions
 *       401:
 *         description: Invalid token
 */
router.get("/admin-dashboard", authenticate, authorizeRole("admin"), (req, res) => {
    res.json({ message: "Welcome Admin!" });
});


/**
 * @swagger
 * /users/customer-dashboard:
 *   get:
 *     summary: Customer Dashboard
 *     description: Access restricted to customers only.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Welcome Customer!
 *       403:
 *         description: Access Denied. Insufficient permissions
 *       401:
 *         description: Invalid token
 */
router.get("/customer-dashboard", authenticate, authorizeRole("customer"), (req, res) => {
    res.json({ message: "Welcome Customer!" });
});

/**
 * @swagger
 * /users/allUsers:
 *   get:
 *     summary: Get all users
 *     description: Fetches all user details (Admin only).
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *       403:
 *         description: Access Denied. Insufficient permissions
 *       401:
 *         description: Invalid token
 */
router.get("/allUsers", authenticate, authorizeRole("admin"), UserController.getallUsers);

/**
 * @swagger
 * /users/singleuser/{id}:
 *   get:
 *     summary: Get single user details
 *     description: Fetches details of a specific user by ID.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized request
 */
router.get("/singleuser/:id",
    [
        param("id").isUUID().withMessage("Invalid user ID format"),
    ],
    authenticate, UserController.userProfile);


module.exports = router;
