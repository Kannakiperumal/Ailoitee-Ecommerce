const express = require("express");
const router = express.Router();
const { body, param, query, validationResult } = require("express-validator");

const ProductController = require("../controllers/productControllet");
const upload = require('../middlewares/multer');

const { authenticate, authorizeRole } = require("../middlewares/auth");

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};


/**
 * @swagger
 * /product/addProduct:
 *   post:
 *     summary: Add a new product with multiple images
 *     description: Upload a new product with its details and images (up to 5) to Cloudinary and save to the database.
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - stock
 *               - categoryId
 *               - images
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the product
 *                 example: "Smartphone"
 *               description:
 *                 type: string
 *                 description: A description of the product
 *                 example: "Latest model smartphone with advanced features."
 *               price:
 *                 type: number
 *                 format: float
 *                 description: The price of the product
 *                 example: 499.99
 *               stock:
 *                 type: integer
 *                 description: The available stock quantity of the product
 *                 example: 100
 *               categoryId:
 *                 type: integer
 *                 description: The ID of the category to which the product belongs
 *                 example: 1
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 5 product images
 *                 maxItems: 5
 *     responses:
 *       201:
 *         description: Product added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product created successfully"
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The unique ID of the product
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: The name of the product
 *                       example: "Smartphone"
 *                     description:
 *                       type: string
 *                       description: A description of the product
 *                       example: "Latest model smartphone with advanced features."
 *                     price:
 *                       type: number
 *                       format: float
 *                       description: The price of the product
 *                       example: 499.99
 *                     stock:
 *                       type: integer
 *                       description: The available stock quantity of the product
 *                       example: 100
 *                     categoryId:
 *                       type: integer
 *                       description: The ID of the category to which the product belongs
 *                       example: 1
 *                     imageUrl:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of image URLs uploaded to Cloudinary
 *                       example: ["http://cloudinary.com/image1", "http://cloudinary.com/image2"]
 *       400:
 *         description: Bad Request (e.g., missing required fields or images)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bad request. Ensure all required fields are provided."
 *       403:
 *         description: Access Denied (only authorized users can add products)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access Denied. Only authorized users can add products."
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


router.post('/addProduct', 
    authenticate, 
    authorizeRole("admin"), 
    upload, // Use multer upload middleware here
    [
        body("name").notEmpty().withMessage("Product name is required"),
        body("description").notEmpty().withMessage("Description is required"),
        body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
        body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
        body("categoryId").isInt().withMessage("Category ID must be a valid integer"),
    ],
    validateRequest,
    ProductController.createProduct
);


/**
 * @swagger
 * /product/updateProduct/{id}:
 *   put:
 *     summary: Update product details by ID
 *     description: Update an existing product's details and images (up to 5) using the product's ID.
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the product to update
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the product
 *                 example: "Smartphone"
 *               description:
 *                 type: string
 *                 description: A description of the product
 *                 example: "Updated model smartphone with improved features."
 *               price:
 *                 type: number
 *                 format: float
 *                 description: The price of the product
 *                 example: 549.99
 *               stock:
 *                 type: integer
 *                 description: The available stock quantity of the product
 *                 example: 120
 *               categoryId:
 *                 type: integer
 *                 description: The ID of the category to which the product belongs
 *                 example: 2
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 5 product images (optional)
 *                 maxItems: 5
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product updated successfully"
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The unique ID of the product
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: The name of the product
 *                       example: "Smartphone"
 *                     description:
 *                       type: string
 *                       description: A description of the product
 *                       example: "Updated model smartphone with improved features."
 *                     price:
 *                       type: number
 *                       format: float
 *                       description: The price of the product
 *                       example: 549.99
 *                     stock:
 *                       type: integer
 *                       description: The available stock quantity of the product
 *                       example: 120
 *                     categoryId:
 *                       type: integer
 *                       description: The ID of the category to which the product belongs
 *                       example: 2
 *                     imageUrl:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of image URLs uploaded to Cloudinary
 *                       example: ["http://cloudinary.com/image1", "http://cloudinary.com/image2"]
 *       400:
 *         description: Bad Request (e.g., invalid product ID, missing required fields, or images)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bad request. Ensure all required fields are provided."
 *       403:
 *         description: Access Denied (only authorized users can update products)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access Denied. Only authorized users can update products."
 *       404:
 *         description: Product not found (invalid product ID)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found."
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

router.put('/updateProduct/:id', authenticate, authorizeRole("admin"), upload,
    [
        param("id").isInt().withMessage("Invalid product ID"),
        body("name").optional().notEmpty().withMessage("Product name cannot be empty"),
        body("description").optional().notEmpty().withMessage("Description cannot be empty"),
        body("price").optional().isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
        body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
        body("categoryId").optional().isInt().withMessage("Category ID must be a valid integer"),
    ],
    validateRequest,
    ProductController.updateProduct);

/**
 * @swagger
 * /product/allProducts:
 *   get:
 *     summary: Get all products
 *     description: Fetch a list of all products from the database.
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Products fetched successfully"
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique ID of the product
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: The name of the product
 *                         example: "Smartphone"
 *                       description:
 *                         type: string
 *                         description: A description of the product
 *                         example: "Latest model smartphone with advanced features."
 *                       price:
 *                         type: number
 *                         format: float
 *                         description: The price of the product
 *                         example: 499.99
 *                       stock:
 *                         type: integer
 *                         description: The available stock quantity of the product
 *                         example: 100
 *                       categoryId:
 *                         type: integer
 *                         description: The ID of the category to which the product belongs
 *                         example: 1
 *                       imageUrl:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: List of image URLs uploaded to Cloudinary
 *                         example: ["http://cloudinary.com/image1", "http://cloudinary.com/image2"]
 *       404:
 *         description: No products found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No products found"
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

router.get('/allProducts', ProductController.getAllProducts);


/**
 * @swagger
 * /product/product/{id}:
 *   get:
 *     summary: Get product details by ID
 *     description: Fetch the details of a product by its ID from the database.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the product
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product fetched successfully"
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The unique ID of the product
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: The name of the product
 *                       example: "Smartphone"
 *                     description:
 *                       type: string
 *                       description: A description of the product
 *                       example: "Latest model smartphone with advanced features."
 *                     price:
 *                       type: number
 *                       format: float
 *                       description: The price of the product
 *                       example: 499.99
 *                     stock:
 *                       type: integer
 *                       description: The available stock quantity of the product
 *                       example: 100
 *                     categoryId:
 *                       type: integer
 *                       description: The ID of the category to which the product belongs
 *                       example: 1
 *                     imageUrl:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of image URLs uploaded to Cloudinary
 *                       example: ["http://cloudinary.com/image1", "http://cloudinary.com/image2"]
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
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

router.get('/product/:id',
    [param("id").isInt().withMessage("Invalid product ID")],
    validateRequest,
    ProductController.getProductById);

/**
 * @swagger
 * /product/deleteProduct/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     description: Delete a product from the database by its ID.
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the product
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product deleted successfully"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
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

router.delete('/deleteProduct/:id', authenticate, authorizeRole("admin"),
    [param("id").isInt().withMessage("Invalid product ID")],
    validateRequest,
    ProductController.deleteProduct);


/**
 * @swagger
 * /product/filterByPrice:
 *   get:
 *     summary: Filter products by price range
 *     description: Retrieve products within a specified price range.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         required: true
 *         description: Minimum price for filtering
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price for filtering
 *     responses:
 *       200:
 *         description: Successfully retrieved filtered products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Products filtered by price range"
 *                 totalProducts:
 *                   type: integer
 *                   example: 5
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Smartphone"
 *                       price:
 *                         type: number
 *                         example: 499.99
 *       400:
 *         description: Missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide both minPrice and maxPrice."
 *       500:
 *         description: Internal Server Error
 */

router.get('/filterByPrice',
    [
        query("minPrice").optional().isFloat({ min: 0 }).withMessage("Minimum price must be a positive number"),
        query("maxPrice").optional().isFloat({ min: 0 }).withMessage("Maximum price must be a positive number"),
    ],
    validateRequest,
    ProductController.filterBrPriceRange);

/**
 * @swagger
 * /product/productsByCategory:
 *   get:
 *     summary: Get products by category
 *     description: Retrieve products filtered by category (e.g., Electronics, Clothing, etc.).
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: The category name to filter products by.
 *     responses:
 *       200:
 *         description: Products retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Products in the 'Electronics' category retrieved successfully."
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Smartphone"
 *                       category:
 *                         type: string
 *                         example: "Electronics"
 *       400:
 *         description: Category parameter is missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category is required for filtering."
 *       404:
 *         description: No products found in the given category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No products found in the 'Toys' category."
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

router.get('/productsByCategory', ProductController.getProductByCategory);

/**
 * @swagger
 * /product/searchbyName:
 *   get:
 *     summary: Search products by name
 *     description: Retrieve products that match the given name (case-insensitive).
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The name (or partial name) of the product to search for.
 *     responses:
 *       200:
 *         description: Successfully retrieved matching products.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Products matching 'iphone' retrieved successfully"
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       name:
 *                         type: string
 *                         example: "iPhone 13 Pro"
 *                       description:
 *                         type: string
 *                         example: "Latest Apple iPhone"
 *                       price:
 *                         type: number
 *                         example: 999.99
 *                       stock:
 *                         type: integer
 *                         example: 10
 *                       categoryId:
 *                         type: string
 *                         example: "2"
 *                       imageUrl:
 *                         type: string
 *                         example: "https://example.com/iphone13.jpg"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-25T12:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-25T12:00:00Z"
 *       400:
 *         description: Product name is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product name is required for searching"
 *       404:
 *         description: No products found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No products found with name: iphone"
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

router.get('/searchbyName', ProductController.searchProductbyName);

/**
 * @swagger
 * /product/productsByLimits:
 *   get:
 *     summary: Get paginated list of products
 *     description: Retrieve products with pagination. Defaults to 10 products per page.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of products per page (default is 100).
 *     responses:
 *       200:
 *         description: Successfully retrieved products with pagination.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Products retrieved successfully"
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalProducts:
 *                   type: integer
 *                   example: 50
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       name:
 *                         type: string
 *                         example: "iPhone 13 Pro"
 *                       description:
 *                         type: string
 *                         example: "Latest Apple iPhone"
 *                       price:
 *                         type: number
 *                         example: 999.99
 *                       stock:
 *                         type: integer
 *                         example: 10
 *                       categoryId:
 *                         type: string
 *                         example: "2"
 *                       imageUrl:
 *                         type: string
 *                         example: "https://example.com/iphone13.jpg"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-25T12:00:00Z"
 *       404:
 *         description: No products found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No products found"
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

router.get('/productsByLimits', ProductController.displayProductsByLimits)

module.exports = router;
