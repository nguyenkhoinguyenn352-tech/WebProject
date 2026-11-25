import {
    getAllScheduledItems,
    addScheduledItem,
    modifyScheduledItem,
    removeScheduledItem
} from '../models/scheduledItemModel.js';

const getScheduledItems = async (req, res) => {
    const items = await getAllScheduledItems(
        req.user.user_id
    );

    res.json(items);
};

const postScheduledItem = async (req, res) => {
    const item = {
        ...req.body,
        user_id: req.user.user_id
    };

    const itemId = await addScheduledItem(item);

    res.status(201).json({
        message: 'Scheduled item created',
        item_id: itemId
    });
};

const putScheduledItem = async (req, res) => {
    const success = await modifyScheduledItem(
        req.body,
        req.params.id,
        req.user.user_id
    );

    if (!success) {
        return res.status(404).json({
            error: 'Scheduled item not found'
        });
    }

    res.json({
        message: 'Scheduled item updated'
    });
};

const deleteScheduledItem = async (req, res) => {
    const success = await removeScheduledItem(
        req.params.id,
        req.user.user_id
    );

    if (!success) {
        return res.status(404).json({
            error: 'Scheduled item not found'
        });
    }

    res.json({
        message: 'Scheduled item deleted'
    });
};

export {
    getScheduledItems,
    postScheduledItem,
    putScheduledItem,
    deleteScheduledItem
};