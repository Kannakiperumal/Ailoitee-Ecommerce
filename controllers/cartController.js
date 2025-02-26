const db = require('../models');
const Cart = db.Cart;
const Product = db.Product;
const User = db.User;

class cartController {
    static async addToCart(req, res) {
        try {
            const { email, productId, quantity } = req.body;
            console.log("Request received:", email, productId, quantity);

            if (!email || !productId || !quantity) {
                return res.status(400).json({
                    message: "Email, ProductId, and quantity are required"
                });
            }

            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const product = await Product.findOne({ where: { id: productId } });

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            console.log("Product found:", product.dataValues);

            const availableStock = Number(product.stock);
            const requestedQuantity = Number(quantity);

            if (availableStock < requestedQuantity) {
                return res.status(400).json({
                    message: `Only ${product.stock} items left in stock`
                });
            }

            const totalPrice = Number(product.price) * requestedQuantity;

            let cartItem = await Cart.findOne({
                where: {
                    userId: user.id,
                    productId
                }
            });

            if (cartItem) {
                cartItem.quantity += requestedQuantity;
                cartItem.price += totalPrice;
                await cartItem.save();
            } else {
                cartItem = await Cart.create({
                    userId: user.id,
                    productId,
                    quantity: requestedQuantity,
                    price: totalPrice
                });
            }


            return res.status(200).json({
                message: "Product added to cart successfully",
                cartItem
            });

        } catch (error) {
            console.error("Error while adding product to cart:", error);
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }

    static async getallCartItems(req, res) {
        try {

            const { email } = req.query;

            if (!email) {
                return res.status(400).json({
                    message: "Email is required"
                })
            }

            const user = await User.findOne({
                where: { email }
            });

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                })
            }

            const cartItems = await Cart.findAll({
                where: {
                    userId: user.id
                },
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: [
                            "id",
                            "name",
                            "price",
                            "stock",
                            "imageUrl"
                        ]
                    }
                ]
            });

            if (cartItems.length === 0) {
                return res.status(200).json({
                    message: "Cart is empty",
                    cartItems: []
                })
            }

            return res.status(200).json({
                message: "Cart items retrieved successfully",
                cartItems
            })
        } catch (error) {

            console.log("Error fetching cart items", error);
            return res.status(500).json({
                message: "Internal server error"
            })
        }
    }

    static async updateCartQuantity(req, res) {
        try {

            const { email, productId, quantity } = req.body;

            if (!email || !productId || !quantity) {
                return res.status(400).json({
                    message: "Email, productId and quantity are required"
                })
            }

            const user = await User.findOne({
                where: {
                    email
                }
            });

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                })
            }

            const product = await Product.findOne({
                where: {
                    id: productId
                }
            });

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                })
            }

            const cartItem = await Cart.findOne({
                where: {
                    userId: user.id,
                    productId
                }
            });

            if (!cartItem) {
                return res.status(404).json({
                    message: "Cart item not found"
                })
            }

            if (quantity > product.stock) {
                return res.status(400).json({
                    message: `Only ${product.stock} items left in stock`
                })
            }

            cartItem.quantity = quantity;
            cartItem.price = quantity * product.price;
            await cartItem.save();


            return res.status(200).json({
                message: "Cart item quantity updated successfully",
                cartItem
            });

        } catch (error) {

            console.log("Error updating cart quantity", error);
            return res.status(500).json({
                message: "Internal server error"
            })
        }
    }

    static async removeCartItem(req, res) {
        try {

            const { email, cartId } = req.params;

            if (!email || !cartId) {
                return res.status(400).json({
                    message: "Email and CartId are required"
                });
            }

            const user = await User.findOne({
                where:
                {
                    email

                }
            });

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const cartItem = await Cart.findOne({
                where: {
                    id: cartId,
                    userId: user.id
                }
            });

            if (!cartItem) {
                return res.status(404).json({
                    message: "Cart item not found"
                });
            }

            await cartItem.destroy();

            return res.status(200).json({
                message: "Cart item removed successfully"
            });

        } catch (error) {

            console.log("Error while removing items from cart", error);
            return res.status(500).json({
                message: "Internal server error"
            })
        }
    }
}

module.exports = cartController;
