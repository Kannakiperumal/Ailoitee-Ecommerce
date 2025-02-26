const db = require('../models');
const Product = db.Product;
const Category = db.Category;

const { validationResult } = require("express-validator");

const cloudinary = require('../config/cloudinary');
const { Op} = require('sequelize');

class productController {

    static async createProduct(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, description, price, stock, categoryId } = req.body;
    
            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(400).json({ message: 'Invalid category ID or Category Not found' });
            }
    
            if (!req.files || (Array.isArray(req.files) && req.files.length === 0) || (!Array.isArray(req.files) && !req.files)) {
                return res.status(400).json({ message: 'No images uploaded' });
            }                    
    
            const imageUrls = [];
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path);
                imageUrls.push(result.secure_url);
            }
    
            const imageUrlsString = imageUrls.join(',');
    
            const newProduct = await Product.create({
                name,
                description,
                price,
                stock,
                categoryId,
                imageUrl: imageUrlsString,
            });
    
            return res.status(201).json({
                message: 'Product created successfully',
                product: newProduct,
            });
        } catch (error) {
            console.error('Error creating product:', error);
            return res.status(500).json({
                message: 'Internal server error',
            });
        }
    }

    static async updateProduct(req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params; 
            const { name, description, price, stock, categoryId } = req.body;

            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (categoryId) {
                const category = await Category.findByPk(categoryId);
                if (!category) {
                    return res.status(400).json({ message: 'Invalid category ID' });
                }
            }

            let imageUrlsString = product.imageUrl; 
            if (req.files && req.files.length > 0) {
                const imageUrls = [];
                for (const file of req.files) {
                    const result = await cloudinary.uploader.upload(file.path);
                    imageUrls.push(result.secure_url); 
                }
                imageUrlsString = imageUrls.join(','); 
            }

            const updatedProduct = await product.update({
                name: name || product.name, 
                description: description || product.description,
                price: price || product.price,
                stock: stock || product.stock,
                categoryId: categoryId || product.categoryId,
                imageUrl: imageUrlsString, 
            });

            return res.status(200).json({
                message: 'Product updated successfully',
                product: updatedProduct,
            });
        } catch (error) {
            console.error('Error updating product:', error);
            return res.status(500).json({
                message: 'Internal server error',
            });
        }
    }

    static async getAllProducts(req, res) {
        try {
            const products = await Product.findAll();

            if (products.length === 0) {
                return res.status(404).json({ message: 'No products found' });
            }

            return res.status(200).json({
                message: 'Products fetched successfully',
                products,
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            return res.status(500).json({
                message: 'Internal server error',
            });
        }
    }

    static async getProductById(req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {

            const { id } = req.params;

            const product = await Product.findByPk(id);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            return res.status(200).json({
                message: 'Product fetched successfully',
                product,
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            return res.status(500).json({
                message: 'Internal server error',
            });
        }
    }

    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            const product = await Product.findByPk(id);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            
            await product.destroy();

            return res.status(200).json({
                message: 'Product deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            return res.status(500).json({
                message: 'Internal server error',
            });
        }
    }

    static async filterBrPriceRange (req, res) {

        try {
            
            let { minPrice, maxPrice } = req.query;

            minPrice = parseFloat(minPrice) || 0;
            maxPrice = parseFloat(maxPrice) || Number.MAX_SAFE_INTEGER;

            const products = await Product.findAll({
                where: {
                    price: {
                        [Op.between]: [ minPrice, maxPrice ]
                    }
                }
            });

            if(products.length === 0) {
                return res.status(400).json({
                    message: "No products found in the given price range"
                })
            }

            return res.status(200).json({
                message: "Products filtered successfully",
                totalProducts: products.length,
                products
            })

        } catch (error) {
            
            console.log("Error while filtering products using price range", error);
            return res.status(500).json({
                message: "Internal server error"
            })
        }
    }

    static async getProductByCategory ( req, res) {

        try {
            
            const { category } = req.query;
            console.log(req.query)

            if(!category) {
                return res.status(400).json({
                    message: "Category is required for filtering"
                })
            }

            const categoryData = await Category.findOne({
                where: {
                    name: { [Op.iLike]: category }
                }
            });

            if(!categoryData) {
                return res.status(404).json({
                    message: `Category ${category} not found`
                })
            }

            const products = await Product.findAll({
                where: {
                    categoryId: categoryData.id.toString()
                }
            });

            if(products.length === 0) {
                return res.status(404).json({
                    message: `No products found in the ${category} category`
                })
            }

            return res.status(200).json({
                message: `Products in the ${category} retrieved successfully`,
                products
            });

        } catch (error) {
            
            console.log("Error while fetching products", error);
            return res.status(500).json({
                message: "Internal server error"
            })
        }
    }

    static async searchProductbyName(req, res) {
        try {
            
            const { name } = req.query;

            if(!name) {
                return res.status(400).json({
                    message: "Product name is required for searching"
                })
            }

            const products = await Product.findAll({
                where: {
                    name: { [Op.iLike]: `%${name}%`}
                }
            });

            if(products.length === 0) {
                return res.status(404).json({
                    message: `No products found with the name ${name}`
                })
            }

            return res.status(200).json({
                message: `Products matching "${name}" retrieved successfully`,
                products
            });

        } catch (error) {
            
            console.log("Error while fetching products", error);
            return res.status(500).json({
                message: "Internal server error"
            })
        }
    }

    static async displayProductsByLimits(req, res) {
        try {
            
            let { page, limit } = req.query;

            page = 1;
            limit = parseInt(limit) || 100;
            const offset = (page - 1) * limit;

            const { count, rows: products } = await Product.findAndCountAll({
                limit: limit,
                offset: offset,
                order: [["createdAt", "DESC"]]
            });

            if(products.length === 0) {
                return res.status(404).json({
                    message: "No products found"
                })
            }

            return res.status(200).json({
                message: "Products retrieved successfully",
                currentPage: page,
                totalPage: Math.ceil(count / limit),
                products
            });

        } catch (error) {
            
            console.log("Error while fetching products", error);
            return res.status(500).json({
                message: "Internal server error"
            })
        }
    }
}


module.exports = productController;