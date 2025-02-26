const express = require("express");
const router = express.Router();

const { body, param, validationResult } = require("express-validator");

const OrderController = require('../controllers/orderController');
const { authenticate, authorizeRole } = require("../middlewares/auth");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};


/**
 * @swagger
 * /order/placeOrder:
 *   post:
 *     summary: Place a new order
 *     description: Creates an order for a user, updates product stock, and calculates total price.
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - productId
 *               - quantity
 *               - address
 *               - city
 *               - zipcode
 *               - deliveryDate
 *               - courierName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               productId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *               city:
 *                 type: string
 *                 example: "New York"
 *               zipcode:
 *                 type: string
 *                 example: "10001"
 *               deliveryDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-01"
 *               courierName:
 *                 type: string
 *                 example: "FedEx"
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order placed successfully"
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     userId:
 *                       type: integer
 *                       example: 45
 *                     totalAmount:
 *                       type: number
 *                       example: 199.99
 *                     status:
 *                       type: string
 *                       example: "Pending"
 *                     address:
 *                       type: string
 *                       example: "123 Main St"
 *                     city:
 *                       type: string
 *                       example: "New York"
 *                     zipcode:
 *                       type: string
 *                       example: "10001"
 *                     deliveryDate:
 *                       type: string
 *                       format: date
 *                       example: "2025-03-01"
 *                     courierName:
 *                       type: string
 *                       example: "FedEx"
 *       400:
 *         description: Bad request (missing fields or insufficient stock)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Only 3 items left in stock"
 *       404:
 *         description: User or product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post('/placeOrder',
  [
    body("email").notEmpty().withMessage("Email is required"),
    body("quantity").isInt({ min: 1 }).withMessage("At least one product is required")
  ],
  validate,
  OrderController.placeOrder);


/**
 * @swagger
 * /order/getOrdersByEmail/{email}:
 *   get:
 *     summary: Get all orders for a user by email
 *     description: Retrieves all orders placed by a user, displaying email, product name, quantity, and other details.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the user whose orders need to be fetched.
 *     responses:
 *       200:
 *         description: Successfully retrieved orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: "user@example.com"
 *                   productName:
 *                     type: string
 *                     example: "Laptop"
 *                   quantity:
 *                     type: integer
 *                     example: 2
 *                   totalAmount:
 *                     type: number
 *                     example: 1500
 *                   status:
 *                     type: string
 *                     example: "Pending"
 *                   address:
 *                     type: string
 *                     example: "123 Street, NY"
 *                   city:
 *                     type: string
 *                     example: "New York"
 *                   zipcode:
 *                     type: string
 *                     example: "10001"
 *                   deliveryDate:
 *                     type: string
 *                     format: date
 *                     example: "2024-03-05"
 *                   courierName:
 *                     type: string
 *                     example: "FedEx"
 *       400:
 *         description: Email is required
 *       404:
 *         description: User not found or no orders found
 *       500:
 *         description: Internal server error
 */

router.get('/getOrdersByEmail/:email', OrderController.getallOrdersByEmail);

/**
 * @swagger
 * /order/getallOrders:
 *   get:
 *     summary: Retrieve all orders
 *     description: Fetches all orders with user email and product details.
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All orders retrieved successfully"
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderId:
 *                         type: integer
 *                         example: 1
 *                       userEmail:
 *                         type: string
 *                         example: "user@example.com"
 *                       productName:
 *                         type: string
 *                         example: "Laptop"
 *                       quantity:
 *                         type: integer
 *                         example: 2
 *                       totalAmount:
 *                         type: number
 *                         example: 5000.00
 *                       status:
 *                         type: string
 *                         example: "Pending"
 *                       address:
 *                         type: string
 *                         example: "123 Street, NY"
 *                       city:
 *                         type: string
 *                         example: "New York"
 *                       zipcode:
 *                         type: string
 *                         example: "10001"
 *                       deliveryDate:
 *                         type: string
 *                         format: date
 *                         example: "2025-03-05"
 *                       courierName:
 *                         type: string
 *                         example: "FedEx"
 *                       orderDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-01T10:30:00.000Z"
 *       404:
 *         description: No orders found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No orders found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.get('/getallOrders', authenticate, authorizeRole("admin"), OrderController.getAllOrders);

/**
 * @swagger
 * /order/getOrderByEmail/{email}/{orderId}:
 *   get:
 *     summary: Retrieve a specific order by email and order ID
 *     description: Fetches order details using the user's email and order ID.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the user
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the order
 *     responses:
 *       200:
 *         description: Successfully retrieved the order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order details retrieved successfully"
 *                 order:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *                       example: 1
 *                     userEmail:
 *                       type: string
 *                       example: "user@example.com"
 *                     productName:
 *                       type: string
 *                       example: "Smartphone"
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     totalAmount:
 *                       type: number
 *                       example: 1500.00
 *                     status:
 *                       type: string
 *                       example: "Shipped"
 *                     address:
 *                       type: string
 *                       example: "456 Street, NY"
 *                     city:
 *                       type: string
 *                       example: "New York"
 *                     zipcode:
 *                       type: string
 *                       example: "10002"
 *                     deliveryDate:
 *                       type: string
 *                       format: date
 *                       example: "2025-03-10"
 *                     courierName:
 *                       type: string
 *                       example: "UPS"
 *                     orderDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-28T12:00:00.000Z"
 *       404:
 *         description: User or Order not found
 *       500:
 *         description: Internal server error
 */

router.get("/getOrderById/:email/:orderId", OrderController.getOrderById);

/**
 * @swagger
 * /order/cancelOrder/{email}/{orderId}:
 *   put:
 *     summary: Cancel an order by email and order ID
 *     description: Cancels an order by setting its status to "Cancelled".
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the user
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the order
 *     responses:
 *       200:
 *         description: Order successfully cancelled
 *       400:
 *         description: Order is already cancelled
 *       404:
 *         description: User or Order not found
 *       500:
 *         description: Internal server error
 */

router.put("/cancelOrder/:email/:orderId",
  [param("orderId").isInt().withMessage("Order ID must be an integer")],
  validate,
  OrderController.cancelOrderById);

module.exports = router;