import {
    getAllScheduledItems,
    addScheduledItem,
    modifyScheduledItem,
    removeScheduledItem
} from '../models/scheduledItemModel.js';


// GET all scheduled items
const getScheduledItems = async (req, res) => {
    const items = await getAllScheduledItems();

    res.json(items);
};


// POST new scheduled item
const postScheduledItem = async (req, res) => {
    const result = await addScheduledItem(req.body);

    if (result) {
        res.status(201).json({
            message: 'Scheduled item created successfully',
            item_id: result.item_id
        });
    } else {
        res.sendStatus(400);
    }
};


// PUT scheduled item
const putScheduledItem = async (req, res) => {
    const result = await modifyScheduledItem(
        req.body,
        req.params.id
    );

    if (result) {
        res.json({
            message: 'Scheduled item updated successfully'
        });
    } else {
        res.sendStatus(404);
    }
};


// DELETE scheduled item
const deleteScheduledItem = async (req, res) => {
    const result = await removeScheduledItem(
        req.params.id
    );

    if (result) {
        res.json({
            message: 'Scheduled item deleted successfully'
        });
    } else {
        res.sendStatus(404);
    }
};


export {
    getScheduledItems,
    postScheduledItem,
    putScheduledItem,
    deleteScheduledItem
};