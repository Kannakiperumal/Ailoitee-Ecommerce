const express = require('express');

const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const cartRoues = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');

const router = express.Router();
router.use('/users', userRoutes);  
router.use('/category', categoryRoutes);
router.use('/product', productRoutes);
router.use('/cart', cartRoues);
router.use('/order', orderRoutes);

module.exports = router;  
