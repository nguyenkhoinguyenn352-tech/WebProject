import {
    getAllCategories,
    getSubcategoriesByCategory
} from '../models/categoryModel.js';


// GET all categories
const getCategories = async (req, res) => {
    const categories = await getAllCategories();

    res.json(categories);
};


// GET subcategories by category id
const getSubcategories = async (req, res) => {
    const categoryId = req.params.id;

    const subcategories = await getSubcategoriesByCategory(
        categoryId
    );

    res.json(subcategories);
};


export {
    getCategories,
    getSubcategories
};