const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const categoryController = require("../controllers/categoryController");
const { authenticate, authorizeRole } = require("../middlewares/auth");


const categoryValidation = [
    body("name")
        .notEmpty().withMessage("Category name is required")
        .isString().withMessage("Category name must be a string")
        .isLength({ min: 3 }).withMessage("Category name must be at least 3 characters long"),
    body("description")
        .optional()
        .isString().withMessage("Description must be a string")
];

/**
 * @swagger
 * /category/addCategory:
 *   post:
 *     summary: Create a new category
 *     description: Adds a new category to the system (Admin only).
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the category
 *                 example: Electronics
 *               description:
 *                 type: string
 *                 description: Description of the category
 *                 example: Devices and gadgets
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category created successfully
 *                 Category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     categoryId:
 *                       type: string
 *                       example: C001
 *                     name:
 *                       type: string
 *                       example: Electronics
 *                     description:
 *                       type: string
 *                       example: Devices and gadgets
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-25T10:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-25T10:00:00Z"
 *       400:
 *         description: Category already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category with this ID already exists
 *       403:
 *         description: Access Denied. Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access Denied. Insufficient permissions
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/addCategory", authenticate, authorizeRole("admin"), categoryValidation, categoryController.createCategory);

/**
 * @swagger
 * /category/updateCategory/{id}:
 *   put:
 *     summary: Update a category by ID
 *     description: Allows admin to update the name and description of an existing category based on its ID.
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the category to be updated.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Electronics"
 *               description:
 *                 type: string
 *                 example: "Updated description for electronic devices."
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category updated successfully"
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "New Electronics"
 *                     description:
 *                       type: string
 *                       example: "Updated description for electronic devices."
 *       400:
 *         description: Bad Request - Invalid or missing data
 *       401:
 *         description: Invalid token
 *       403:
 *         description: Access Denied. Insufficient permissions
 *       404:
 *         description: Category not found
 */
router.put("/updateCategory/:id", authenticate, authorizeRole("admin"),
    [
        param("id").isInt().withMessage("Category ID must be an integer"),
        ...categoryValidation
    ],
    categoryController.updateCategory);

/**
 * @swagger
 * /category/getAllCategories:
 *   get:
 *     summary: Get all categories
 *     description: Fetches a list of all categories.
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Categories fetched successfully
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       categoryId:
 *                         type: string
 *                         example: "C001"
 *                       name:
 *                         type: string
 *                         example: "Electronics"
 *                       description:
 *                         type: string
 *                         example: "Devices and gadgets"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-25T10:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-25T10:00:00Z"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

router.get("/getAllCategories", categoryController.getAllCategories);

/**
 * @swagger
 * /category/getCategory/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Fetches details of a category by its ID. Accessible by both admins and customers.
 *     tags: [Categories]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the category to fetch
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Category details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category fetched successfully
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     categoryId:
 *                       type: string
 *                       example: "C001"
 *                     name:
 *                       type: string
 *                       example: "Electronics"
 *                     description:
 *                       type: string
 *                       example: "Devices and gadgets"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-25T10:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-25T10:00:00Z"
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

router.get("/getCategory/:id",
    param("id").isInt().withMessage("Category ID must be an integer"),
    categoryController.getCategoryById);

/**
 * @swagger
 * /category/deleteCategory/{id}:
 *   delete:
 *     summary: Delete category by ID
 *     description: Deletes a category by its ID. Accessible only by admins.
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the category to delete
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category not found"
 *       403:
 *         description: Access Denied (Only admins can delete categories)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access Denied. Only admins can delete categories"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.delete("/deleteCategory/:id", authenticate, authorizeRole("admin"),
    param("id").isInt().withMessage("Category ID must be an integer"),
    categoryController.deleteCategoryById);


module.exports = router;
