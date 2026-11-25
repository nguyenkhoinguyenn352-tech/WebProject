const API = 'http://localhost:3000/api';

const token = sessionStorage.getItem('token');
const user = JSON.parse(sessionStorage.getItem('user') || 'null');

let scheduledItems = [];
let workLogs = [];
let reportCategories = [];

let editingTaskId = null;
let editingLogId = null;

const $ = id => document.getElementById(id);

if (!token) {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await request('/auth/me');
    } catch {
        logout();
        return;
    }

    showUser();
    setupNavigation();
    setupForms();
    setupLogout();

    setToday();
    setReportRange();

    await Promise.all([
        loadCategories(),
        loadScheduledItems(),
        loadWorkLogs()
    ]);
});

async function request(path, options = {}) {
    const headers = {
        Authorization: `Bearer ${token}`,
        ...options.headers
    };

    if (options.body) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API}${path}`, {
        ...options,
        headers
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(data?.error || 'Request failed');
    }

    return data;
}

function showUser() {
    const name = user?.name || 'User';

    $('userName').textContent = name;
    $('welcomeName').textContent = name;
    $('userAvatar').textContent =
        name.charAt(0).toUpperCase();
}

function setupNavigation() {
    document.querySelectorAll(
        '.nav-item, [data-open-page]'
    ).forEach(button => {
        button.addEventListener('click', () => {
            openPage(
                button.dataset.page ||
                button.dataset.openPage
            );
        });
    });
}

function openPage(name) {
    document.querySelectorAll('.page')
        .forEach(page =>
            page.classList.remove('active')
        );

    document.querySelectorAll('.nav-item')
        .forEach(button =>
            button.classList.remove('active')
        );

    $(`page-${name}`).classList.add('active');

    document
        .querySelector(`[data-page="${name}"]`)
        ?.classList.add('active');
}

function setupLogout() {
    $('logoutButton').addEventListener(
        'click',
        logout
    );
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

function setupForms() {
    $('scheduleForm').addEventListener(
        'submit',
        saveScheduledItem
    );

    $('workLogForm').addEventListener(
        'submit',
        saveWorkLog
    );

    $('reportForm').addEventListener(
        'submit',
        generateReport
    );

    $('schedule_category_id')
        .addEventListener('change', () =>
            loadSubcategories(
                'schedule_category_id',
                'schedule_subcategory_id'
            )
        );

    $('category_id')
        .addEventListener('change', () =>
            loadSubcategories(
                'category_id',
                'subcategory_id'
            )
        );
}

async function loadScheduledItems() {
    scheduledItems =
        await request('/scheduled-items');

    $('scheduledCount').textContent =
        scheduledItems.length;

    renderScheduleList();
    renderRecentTasks();
    fillScheduledItems();
}

function renderRecentTasks() {
    const items = scheduledItems.slice(0, 3);

    $('homeScheduleList').innerHTML =
        items.length
            ? items.map(item => `
                <div class="task-row">
                    <div>
                        <strong>
                            ${escapeHtml(item.title)}
                        </strong>

                        <p>
                            ${escapeHtml(item.item_type)}
                            ·
                            ${formatDateTime(
                item.start_date
            )}
                        </p>
                    </div>
                </div>
            `).join('')
            : 'No scheduled tasks yet.';
}

function renderScheduleList() {
    $('scheduleList').innerHTML =
        scheduledItems.length
            ? scheduledItems.map(item => `
                <div class="task-row">
                    <div>
                        <strong>
                            ${escapeHtml(item.title)}
                        </strong>

                        <p>
                            ${escapeHtml(item.item_type)}
                            |
                            ${formatDateTime(item.start_date)}
                            -
                            ${formatDateTime(item.end_date)}
                        </p>

                        <p>
                            ${escapeHtml(
                item.category_name ||
                'Not set'
            )}
                            |
                            ${escapeHtml(
                item.subcategory_name ||
                'Not set'
            )}
                            |
                            ${escapeHtml(
                item.time_of_day ||
                'Not set'
            )}
                        </p>
                    </div>

                    <div class="actions">
                        <button
                            onclick="editScheduledItem(
                                ${item.item_id}
                            )">
                            Edit
                        </button>

                        <button
                            class="delete-button"
                            onclick="deleteScheduledItem(
                                ${item.item_id}
                            )">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('')
            : 'No scheduled tasks yet.';
}

async function saveScheduledItem(event) {
    event.preventDefault();

    const item = {
        title: $('title').value,
        item_type: $('item_type').value,
        category_id:
        $('schedule_category_id').value,
        subcategory_id:
            $('schedule_subcategory_id').value ||
            null,
        time_of_day:
        $('schedule_time_of_day').value,
        start_date: $('start_date').value,
        end_date: $('end_date').value || null
    };

    const path = editingTaskId
        ? `/scheduled-items/${editingTaskId}`
        : '/scheduled-items';

    await request(path, {
        method: editingTaskId ? 'PUT' : 'POST',
        body: JSON.stringify(item)
    });

    editingTaskId = null;

    $('scheduleForm').reset();

    $('scheduleSubmitButton').textContent =
        'Add Task';

    resetSubcategory(
        'schedule_subcategory_id'
    );

    await loadScheduledItems();
}

async function editScheduledItem(id) {
    const item = scheduledItems.find(
        item => item.item_id == id
    );

    if (!item) return;

    editingTaskId = id;

    $('title').value = item.title;
    $('item_type').value = item.item_type;

    $('schedule_category_id').value =
        item.category_id || '';

    await loadSubcategories(
        'schedule_category_id',
        'schedule_subcategory_id'
    );

    $('schedule_subcategory_id').value =
        item.subcategory_id || '';

    $('schedule_time_of_day').value =
        item.time_of_day || '';

    $('start_date').value =
        inputDate(item.start_date);

    $('end_date').value =
        inputDate(item.end_date);

    $('scheduleSubmitButton').textContent =
        'Update Task';

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

async function deleteScheduledItem(id) {
    if (!confirm('Delete this scheduled task?')) {
        return;
    }

    await request(`/scheduled-items/${id}`, {
        method: 'DELETE'
    });

    await loadScheduledItems();
}

function fillScheduledItems() {
    $('scheduled_item_id').innerHTML =
        '<option value="">None</option>' +
        scheduledItems.map(item => `
            <option value="${item.item_id}">
                ${escapeHtml(item.title)}
            </option>
        `).join('');
}

async function loadCategories() {
    const categories =
        await request('/categories');

    const options =
        '<option value="">Select Category</option>' +
        categories.map(category => `
            <option value="${category.category_id}">
                ${escapeHtml(
            category.category_name
        )}
            </option>
        `).join('');

    $('category_id').innerHTML = options;

    $('schedule_category_id').innerHTML =
        options;
}

async function loadSubcategories(
    categoryElement,
    subcategoryElement
) {
    const categoryId =
        $(categoryElement).value;

    resetSubcategory(subcategoryElement);

    if (!categoryId) return;

    const items = await request(
        `/categories/${categoryId}/subcategories`
    );

    $(subcategoryElement).innerHTML +=
        items.map(item => `
            <option value="${item.subcategory_id}">
                ${escapeHtml(
            item.subcategory_name
        )}
            </option>
        `).join('');
}

function resetSubcategory(id) {
    $(id).innerHTML =
        '<option value="">Select Subcategory</option>';
}

async function loadWorkLogs() {
    workLogs = await request('/worklogs');

    $('workLogCount').textContent =
        workLogs.length;

    renderWorkLogs();
}

function renderWorkLogs() {
    $('workLogList').innerHTML =
        workLogs.length
            ? workLogs.map(log => `
                <div class="task-row">
                    <div>
                        <strong>
                            ${escapeHtml(
                log.category_name
            )}
                        </strong>

                        <p>
                            ${escapeHtml(
                log.description
            )}
                        </p>
                    </div>

                    <div class="actions">
                        <span>
                            ${log.hours}h
                            ·
                            ${formatDate(
                log.work_date
            )}
                        </span>

                        <button
                            onclick="editWorkLog(
                                ${log.log_id}
                            )">
                            Edit
                        </button>

                        <button
                            class="delete-button"
                            onclick="deleteWorkLog(
                                ${log.log_id}
                            )">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('')
            : 'No work logs yet.';
}

async function saveWorkLog(event) {
    event.preventDefault();

    const log = {
        work_date: $('work_date').value,
        hours: $('hours').value,
        time_of_day: $('time_of_day').value,
        scheduled_item_id:
            $('scheduled_item_id').value ||
            null,
        category_id:
        $('category_id').value,
        subcategory_id:
            $('subcategory_id').value ||
            null,
        description:
        $('description').value
    };

    const path = editingLogId
        ? `/worklogs/${editingLogId}`
        : '/worklogs';

    await request(path, {
        method: editingLogId ? 'PUT' : 'POST',
        body: JSON.stringify(log)
    });

    editingLogId = null;

    $('workLogForm').reset();

    $('workLogSubmitButton').textContent =
        'Add Work Log';

    resetSubcategory('subcategory_id');

    setToday();

    await loadWorkLogs();
}

async function editWorkLog(id) {
    const log = workLogs.find(
        log => log.log_id == id
    );

    if (!log) return;

    editingLogId = id;

    $('work_date').value =
        inputDate(log.work_date);

    $('hours').value = log.hours;

    $('time_of_day').value =
        log.time_of_day;

    $('scheduled_item_id').value =
        log.scheduled_item_id || '';

    $('category_id').value =
        log.category_id;

    await loadSubcategories(
        'category_id',
        'subcategory_id'
    );

    $('subcategory_id').value =
        log.subcategory_id || '';

    $('description').value =
        log.description;

    $('workLogSubmitButton').textContent =
        'Update Work Log';

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

async function deleteWorkLog(id) {
    if (!confirm('Delete this work log?')) {
        return;
    }

    await request(`/worklogs/${id}`, {
        method: 'DELETE'
    });

    await loadWorkLogs();
}

async function generateReport(event) {
    event.preventDefault();

    const from = $('reportFrom').value;
    const to = $('reportTo').value;

    const report = await request(
        `/reports?from=${from}&to=${to}`
    );

    renderReport(report);
}

function renderReport(report) {
    const grouped = {};

    report.work_logs.forEach(log => {
        const category =
            log.category_name ||
            'Uncategorized';

        const subcategory =
            log.subcategory_name ||
            'Other';

        if (!grouped[category]) {
            grouped[category] = {
                name: category,
                hours: 0,
                subcategories: {}
            };
        }

        grouped[category].hours +=
            Number(log.hours);

        if (!grouped[category]
            .subcategories[subcategory]) {

            grouped[category]
                .subcategories[subcategory] = [];
        }

        grouped[category]
            .subcategories[subcategory]
            .push(log);
    });

    reportCategories =
        Object.values(grouped);

    if (!reportCategories.length) {
        $('reportResult').innerHTML =
            '<div class="card">No work recorded.</div>';

        return;
    }

    $('reportResult').innerHTML =
        reportCategories.map(
            renderCategoryReport
        ).join('');
}

function renderCategoryReport(category, index) {
    const sections = Object.entries(
        category.subcategories
    ).map(([name, logs]) => {

        const hours = logs.reduce(
            (total, log) =>
                total + Number(log.hours),
            0
        );

        const details = logs.map(log => `
            <div class="task-row">
                <div>
                    <strong>
                        ${escapeHtml(
            log.scheduled_item ||
            log.description
        )}
                    </strong>

                    ${log.scheduled_item
            ? `<p>${escapeHtml(
                log.description
            )}</p>`
            : ''
        }
                </div>

                <span>
                    ${log.hours}h ·
                    ${escapeHtml(log.time_of_day)}
                    ·
                    ${formatDate(log.work_date)}
                </span>
            </div>
        `).join('');

        return `
            <div class="report-subcategory">
                <h4>
                    ${escapeHtml(name)}
                    — ${hours} hours
                </h4>

                ${details}
            </div>
        `;
    }).join('');

    return `
        <div class="report-category">

            <div class="report-category-header">

                <div>
                    <h2>
                        ${escapeHtml(category.name)}
                    </h2>

                    <strong>
                        Total Hours:
                        ${category.hours}
                    </strong>
                </div>

                <button
                    class="primary-button"
                    onclick="copyCategoryReport(
                        ${index}
                    )">
                    Copy
                </button>

            </div>

            ${sections}

        </div>
    `;
}

async function copyCategoryReport(index) {
    const category =
        reportCategories[index];

    if (!category) return;

    let text =
        `${category.name}\n` +
        `Total Hours: ${category.hours}\n\n`;

    Object.entries(category.subcategories)
        .forEach(([name, logs]) => {

            const hours = logs.reduce(
                (total, log) =>
                    total + Number(log.hours),
                0
            );

            text +=
                `${name} - ${hours} hours\n`;

            logs.forEach(log => {
                if (log.scheduled_item) {
                    text +=
                        `- ${log.scheduled_item}: ` +
                        `${log.description} `;
                } else {
                    text +=
                        `- ${log.description} `;
                }

                text +=
                    `(${log.hours} hours, ` +
                    `${log.time_of_day}, ` +
                    `${formatDate(
                        log.work_date
                    )})\n`;
            });

            text += '\n';
        });

    await navigator.clipboard.writeText(text);

    alert('Category report copied.');
}

function setToday() {
    $('work_date').value =
        formatInputDate(new Date());
}

function setReportRange() {
    const today = new Date();

    $('reportFrom').value =
        formatInputDate(
            new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                16
            )
        );

    $('reportTo').value =
        formatInputDate(
            new Date(
                today.getFullYear(),
                today.getMonth(),
                15
            )
        );
}

function formatInputDate(date) {
    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, '0');

    const day =
        String(date.getDate())
            .padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function inputDate(date) {
    return date
        ? String(date).slice(0, 16)
        : '';
}

function formatDate(date) {
    if (!date) return 'N/A';

    const [year, month, day] =
        String(date)
            .split('T')[0]
            .split('-');

    return `${month}/${day}/${year}`;
}

function formatDateTime(date) {
    if (!date) return 'N/A';

    const [datePart, time = ''] =
        String(date).split('T');

    return `${formatDate(datePart)} ${
        time.slice(0, 5)
    }`.trim();
}

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[char]);
}