const db = require('../models');
const { sequelize } = require('../models');
const Order = db.Order;
const User = db.User;
const Product = db.Product;

class orderController {

    static async placeOrder(req, res) {

        const t = await sequelize.transaction();

        try {
            
            const { email, productId, quantity, address, city, zipcode, deliveryDate, courierName } = req.body;

            if (!email || !productId || !quantity || !address || !city || !zipcode || !deliveryDate || !courierName) {
                return res.status(400).json({
                    message: "All fields (email, productId, quantity, address, city, zipcode, deliveryDate, courierName) are required"
                });
            }

            const user = await User.findOne({
                where: {
                    email
                },
                transaction: t
            });

            if(!user) {
                return res.status(404).json({
                    message: "User not found"
                })
            }

            const product = await Product.findOne({
                where: {
                    id: productId
                }
            });

            if(!product) {
                return res.status(404).json({
                    message: "Product not found"
                })
            }

            if(product.stock < quantity) {
                return res.status(400).json({
                    message: `Only ${product.stock} items left in stock`
                })
            }

            const totalAmount = product.price * quantity;

            product.stock -= quantity;
            await product.save({ transaction: t });

            const order = await Order.create({
                userId: user.id,
                productId,
                totalAmount,
                quantity,
                status: "Pending",
                address,
                city,
                zipcode,
                deliveryDate,
                courierName
            }, { transaction: t } );

            await t.commit();

            return res.status(201).json({
                message: "Order placed successfully",
                order
            });

        } catch (error) {
            
            console.log("Error while placing order", error);
            return res.status(500).json({
                message: "Internal server error"
            })
        }
    }

    static async getallOrdersByEmail( req, res ) {
        try {
            
            const { email } = req.params;

            if(!email) {
                return res.status(400).json({
                    message: "Email is required"
                })
            }

            const user = await User.findOne({
                where: {
                    email
                }
            });

            if(!user) {
                return res.status(400).json({
                    message: "User not found"
                })
            }

            const orders = await Order.findAll({
                where: {
                    userId: user.id
                },
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: ["name"]
                    }
                ],
                attributes: ["quantity", "totalAmount", "status", "address", "city", "zipcode", "deliveryDate", "courierName"]
            });

            if(orders.length === 0) {
                return res.status(404).json({
                    message: "No orders found for this user"
                })
            }

            const orderDetails = orders.map( order => ({
                email: user.email,
                productName: order.product.name,
                quantity: order.quantity,
                totalAmount: order.totalAmount,
                status: order.status,
                address: order.address,
                city: order.city,
                zipcode: order.zipcode,
                deliveryDate: order.deliveryDate,
                courierName: order.courierName
            }));

            return res.status(200).json({
                message: "Order History retrieved successfully",
                orderData: orderDetails
            })
        } catch (error) {
            
            console.log("Error while fetching orders", error);
            return res.status(500).json({
                message: "Internal server error"
            })
        }
    }

    static async getAllOrders(req, res) {
        try {
            const orders = await Order.findAll({
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["email"] 
                    },
                    {
                        model: Product,
                        as: "product", 
                        attributes: ["name"] 
                    }
                ],
                attributes: ["id", "quantity", "totalAmount", "status", "address", "city", "zipcode", "deliveryDate", "courierName", "createdAt"]
            });
    
            if (orders.length === 0) {
                return res.status(404).json({
                    message: "No orders found"
                });
            }
    
            const orderDetails = orders.map(order => ({
                orderId: order.id,
                userEmail: order.user.email,
                productName: order.product.name,
                quantity: order.quantity,
                totalAmount: order.totalAmount,
                status: order.status,
                address: order.address,
                city: order.city,
                zipcode: order.zipcode,
                deliveryDate: order.deliveryDate,
                courierName: order.courierName,
                orderDate: order.createdAt
            }));
    
            return res.status(200).json({
                message: "All orders retrieved successfully",
                orders: orderDetails
            });
    
        } catch (error) {

            console.error("Error fetching all orders", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }

    static async getOrderById( req, res) {
        try {
            
            const { email, orderId } = req.params;

            const user = await User.findOne({
                where: {
                    email: email
                },
                attributes: [
                    "id",
                    "email"
                ]
            });

            if (!user) {
                return res.status(404).json({
                    message: "User not found with the given email"
                });
            }

            const order = await Order.findOne({
                where: {
                    id: orderId,
                    userId: user.id
                },
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: ["name"]
                    }
                ],
                attributes: ["id", "quantity", "totalAmount", "status", "address", "city", "zipcode", "deliveryDate", "courierName", "createdAt"]
            });

            if(!order) {
                return res.status(404).json({
                    message: "Order not found for the given email and orderId"
                })
            }

            const orderDetails = {
                orderId: order.id,
                userEmail: user.email,
                productName: order.product ? order.product.name : "N/A",
                quantity: order.quantity,
                totalAmount: order.totalAmount,
                status: order.status,
                address: order.address,
                city: order.city,
                zipcode: order.zipcode,
                deliveryDate: order.deliveryDate,
                courierName: order.courierName,
                orderDate: order.createdAt
            };
    
            return res.status(200).json({
                message: "Order details retrieved successfully",
                order: orderDetails
            });

        } catch (error) {
            
            console.log("Error while fetching order details", error);
            return res.status(500).json({
                message: "Internal server error"
            })
        }
    }
    
    static async cancelOrderById ( req, res ) {
        try {
            
            const { email, orderId } = req.params;

            const user = await User.findOne({
                where: 
                { email: email 

                },
                attributes: 
                [
                    "id", 
                    "email"
                ]
            });
    
            if (!user) {
                return res.status(404).json({
                    message: "User not found with the given email"
                });
            }

            const order = await Order.findOne({
                where: {
                    id: orderId,
                    userId: user.id
                },
                attributes: [
                    "id", 
                    "status"
                ]
            });
    
            if (!order) {
                return res.status(404).json({
                    message: "Order not found for the given email and orderId"
                });
            }

            if (order.status === "Cancelled") {
                return res.status(400).json({
                    message: "Order is already cancelled"
                });
            }

            await Order.update(
                { status: "Cancelled" },
                { where: { id: orderId, userId: user.id } }
            ); 

            return res.status(200).json({
                message: "Order cancelled successfully",
                orderId: orderId,
                userEmail: user.email
            });


        } catch (error) {
            
            console.log("Error while cancelling order", error);
            return res.status(500).json({
                message: "Internal server error"
            })
        }
    }
}

module.exports = orderController;