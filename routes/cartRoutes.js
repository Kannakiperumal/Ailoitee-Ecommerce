const express = require("express");
const router = express.Router();
const { body, param, query } = require("express-validator");

const CartController = require('../controllers/cartController');

/**
 * @swagger
 * /cart/addCart:
 *   post:
 *     summary: Add a product to the cart
 *     description: Adds a product to the user's cart and updates the stock in the product table.
 *     tags:
 *       - Cart
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: Email of the user adding the product.
 *               productId:
 *                 type: integer
 *                 example: 5
 *                 description: ID of the product being added to the cart.
 *               quantity:
 *                 type: integer
 *                 example: 4
 *                 description: Quantity of the product being added to the cart.
 *     responses:
 *       200:
 *         description: Product successfully added to the cart.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product added to cart successfully"
 *                 cartItem:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 2
 *                     productId:
 *                       type: integer
 *                       example: 5
 *                     quantity:
 *                       type: integer
 *                       example: 4
 *                     price:
 *                       type: number
 *                       format: float
 *                       example: 2000
 *       400:
 *         description: Invalid request, missing fields, or insufficient stock.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Only 3 items left in stock"
 *       404:
 *         description: User or product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post('/addCart',
    [
        body("email").isEmail().withMessage("Invalid email format"),
        body("productId").isInt({ gt: 0 }).withMessage("Product ID must be a positive integer"),
        body("quantity").isInt({ gt: 0 }).withMessage("Quantity must be a positive integer"),
    ],
    CartController.addToCart)

/**
 * @swagger
 * /cart/getallCart:
 *   get:
 *     summary: Retrieve all cart items for a user
 *     description: Fetches all cart items along with product details for the given user.
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         example: "user@example.com"
 *         description: Email of the user whose cart items need to be fetched.
 *     responses:
 *       200:
 *         description: Successfully retrieved cart items.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart items retrieved successfully"
 *                 cartItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       userId:
 *                         type: integer
 *                         example: 2
 *                       productId:
 *                         type: integer
 *                         example: 5
 *                       quantity:
 *                         type: integer
 *                         example: 3
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 1500
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-26T05:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-26T05:10:00.000Z"
 *                       product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                           name:
 *                             type: string
 *                             example: "Classic Leather Wallet"
 *                           price:
 *                             type: number
 *                             format: float
 *                             example: 500
 *                           stock:
 *                             type: integer
 *                             example: 10
 *                           imageUrl:
 *                             type: string
 *                             format: uri
 *                             example: "https://res.cloudinary.com/example/image.jpg"
 *       400:
 *         description: Invalid request or missing email parameter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email is required"
 *       404:
 *         description: No cart items found for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No items found in cart"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.get('/getallCart',
    [query("email").isEmail().withMessage("Invalid email format")],
    CartController.getallCartItems);

/**
 * @swagger
 * /cart/updateCartQuantity:
 *   put:
 *     summary: Update the quantity of a product in the cart
 *     description: Updates the quantity of a product in the user's cart while dynamically adjusting the product stock.
 *     tags:
 *       - Cart
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: Email of the user whose cart is being updated.
 *               productId:
 *                 type: integer
 *                 example: 5
 *                 description: ID of the product in the cart.
 *               quantity:
 *                 type: integer
 *                 example: 3
 *                 description: New quantity for the product in the cart.
 *     responses:
 *       200:
 *         description: Cart item quantity updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart item quantity updated successfully"
 *                 cartItem:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 2
 *                     productId:
 *                       type: integer
 *                       example: 5
 *                     quantity:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Invalid request or insufficient stock.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Only 2 items left in stock"
 *       404:
 *         description: User, product, or cart item not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart item not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.put('/updateCartQuantity',
    [
        body("email").isEmail().withMessage("Invalid email format"),
        body("productId").isInt({ gt: 0 }).withMessage("Product ID must be a positive integer"),
        body("quantity").isInt({ gt: 0 }).withMessage("Quantity must be a positive integer"),
    ],
    CartController.updateCartQuantity)

/**
 * @swagger
 * /cart/removeCartItem/{email}/{cartId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     description: Removes an item from the user's cart using email and cartId.
 *     tags:
 *       - Cart
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "user@example.com"
 *         description: "Email of the user whose cart item needs to be removed."
 *       - name: cartId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 123
 *         description: "ID of the cart item to remove."
 *     responses:
 *       200:
 *         description: "Cart item removed successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart item removed successfully."
 *       400:
 *         description: "Invalid request, email and cartId are required."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email and cartId are required."
 *       404:
 *         description: "User or cart item not found."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart item not found."
 *       500:
 *         description: "Internal server error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

router.delete('/removeCartItem/:email/:cartId',
    [
        param("email").isEmail().withMessage("Invalid email format"),
        param("cartId").isInt({ gt: 0 }).withMessage("Cart ID must be a positive integer"),
    ],
    CartController.removeCartItem)

module.exports = router;