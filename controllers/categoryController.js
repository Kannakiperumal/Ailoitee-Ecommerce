const { validationResult } = require("express-validator");

const db = require('../models');
const Category = db.Category;

class categoryController {

    static async createCategory(req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {

            const { name, description } = req.body;

            //latest category
            const lastCategory = await Category.findOne({
                order: [[
                    'id', 'DESC'
                ]]
            });

            let newCategoryId = "C001";

            if (lastCategory) {

                const lastCategoryNumber = parseInt(lastCategory.categoryId.slice(1), 10);
                newCategoryId = `C${(lastCategoryNumber + 1).toString().padStart(3, '0')}`;
            }

            //check existing one
            const existingCategory = await Category.findOne({
                where: {
                    categoryId: newCategoryId
                }
            });

            if (existingCategory) {
                return res.status(400).json({
                    message: "Category already existed"
                })
            }

            //create new 
            const newCategory = await Category.create({
                categoryId: newCategoryId,
                name,
                description
            });

            return res.status(201).json({
                message: "Category created successfully",
                Category: newCategory
            });

        } catch (error) {

            console.log("Error while adding category", error);
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }


    static async updateCategory(req, res) {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { name, description } = req.body;

            // console.log("Received category ID:", id);
            // console.log("Received body:", req.body);  


            if (!name || !description) {
                return res.status(400).json({ message: "Both name and description are required" });
            }

            const categoryId = parseInt(id, 10);
            console.log("Parsed categoryId:", categoryId);

            if (isNaN(categoryId)) {
                return res.status(400).json({ message: "Invalid category ID" });
            }

            // Check if category exists
            const category = await Category.findOne({ where: { id: categoryId } });
            if (!category) {
                console.log("Category not found with ID:", categoryId);
                return res.status(400).json({ message: "Category not found" });
            }

            // Get the current timestamp
            const currentTime = new Date();

            // update the category
            const [affectedRows] = await Category.update(
                { name, description, updatedAt: currentTime },
                { where: { id: categoryId } }
            );

            console.log("Affected rows:", affectedRows);

            const updatedCategory = await Category.findOne({
                where: { id: categoryId },
            });

            if (!updatedCategory) {
                console.log("Category not found after update. ID:", categoryId);
                return res.status(400).json({ message: "Category not found after update" });
            }

            return res.status(200).json({
                message: "Category updated successfully",
                categoryData: updatedCategory,
            });

        } catch (error) {
            console.log("Error while updating category:", error);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    }

    static async getAllCategories(req, res) {
        try {

            const categories = await Category.findAll();

            if (!categories.length) {
                return res.status(404).json({ message: "No categories found" });
            }

            return res.status(200).json({
                message: "Categories fetched successfully",
                categories
            });

        } catch (error) {

            console.log("Error while fetching categories", error);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    }


    static async getCategoryById(req, res) {
        try {

            const categoryId = req.params.id;


            const category = await Category.findOne({
                where: { id: categoryId }
            });


            if (!category) {
                return res.status(404).json({ message: "Category not found" });
            }

            return res.status(200).json({
                message: "Category fetched successfully",
                category
            });

        } catch (error) {
            console.log("Error while fetching category", error);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    }

    static async deleteCategoryById(req, res) {
        try {
            const categoryId = req.params.id;

            const category = await Category.findOne({
                where: { id: categoryId }
            });

            if (!category) {
                return res.status(404).json(
                    {
                        message: "Category not found"
                    });
            }

            await Category.destroy({
                where: { id: categoryId }
            });

            return res.status(200).json({
                message: "Category deleted successfully"
            });
            
        } catch (error) {
            console.log("Error while deleting category", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }

}


module.exports = categoryController;