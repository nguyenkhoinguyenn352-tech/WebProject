import {
    getMonthlyReport,
    getDateRangeReport
} from '../models/reportModel.js';


// GET monthly report
const getReportByMonth = async (req, res) => {
    const year = req.query.year;
    const month = req.query.month;

    if (!year || !month) {
        return res.status(400).json({
            error: 'Year and month are required'
        });
    }

    const rows = await getMonthlyReport(year, month);

    let totalHours = 0;
    const categorySummary = {};

    for (const row of rows) {
        const hours = Number(row.hours);

        totalHours += hours;

        if (!categorySummary[row.category_name]) {
            categorySummary[row.category_name] = 0;
        }

        categorySummary[row.category_name] += hours;
    }

    const hoursByCategory = Object.entries(
        categorySummary
    ).map(([category_name, hours]) => ({
        category_name,
        hours
    }));

    res.json({
        year: Number(year),
        month: Number(month),
        total_hours: totalHours,
        hours_by_category: hoursByCategory,
        work_logs: rows
    });
};


// GET report by date range
const getReportByDateRange = async (req, res) => {
    const fromDate = req.query.from;
    const toDate = req.query.to;

    if (!fromDate || !toDate) {
        return res.status(400).json({
            error: 'From date and to date are required'
        });
    }

    if (fromDate > toDate) {
        return res.status(400).json({
            error: 'From date cannot be after to date'
        });
    }

    const rows = await getDateRangeReport(
        fromDate,
        toDate
    );

    let totalHours = 0;
    const categorySummary = {};

    for (const row of rows) {
        const hours = Number(row.hours);

        totalHours += hours;

        if (!categorySummary[row.category_name]) {
            categorySummary[row.category_name] = 0;
        }

        categorySummary[row.category_name] += hours;
    }

    const hoursByCategory = Object.entries(
        categorySummary
    ).map(([category_name, hours]) => ({
        category_name,
        hours
    }));

    res.json({
        from_date: fromDate,
        to_date: toDate,
        total_hours: totalHours,
        hours_by_category: hoursByCategory,
        work_logs: rows
    });
};


export {
    getReportByMonth,
    getReportByDateRange
};