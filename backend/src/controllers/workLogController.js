import {
    getAllWorkLogs,
    addWorkLog,
    modifyWorkLog,
    removeWorkLog
} from '../models/workLogModel.js';


// GET all work logs
const getWorkLogs = async (req, res) => {
    const workLogs = await getAllWorkLogs();

    res.json(workLogs);
};


// POST new work log
const postWorkLog = async (req, res) => {
    const result = await addWorkLog(req.body);

    if (result) {
        res.status(201).json({
            message: 'Work log created successfully',
            log_id: result.log_id
        });
    } else {
        res.sendStatus(400);
    }
};


// PUT work log
const putWorkLog = async (req, res) => {
    const result = await modifyWorkLog(
        req.body,
        req.params.id
    );

    if (result) {
        res.json({
            message: 'Work log updated successfully'
        });
    } else {
        res.sendStatus(404);
    }
};


// DELETE work log
const deleteWorkLog = async (req, res) => {
    const result = await removeWorkLog(
        req.params.id
    );

    if (result) {
        res.json({
            message: 'Work log deleted successfully'
        });
    } else {
        res.sendStatus(404);
    }
};


export {
    getWorkLogs,
    postWorkLog,
    putWorkLog,
    deleteWorkLog
};