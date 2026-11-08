// Backend API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const scheduleForm = document.getElementById('scheduleForm');

    // Load initial schedule list
    loadScheduledItems();

    // Event listener for form submission
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('title').value;
            const start_date = document.getElementById('start_date').value;
            const end_date = document.getElementById('end_date').value;

            try {
                const response = await fetch(`${API_BASE_URL}/scheduled-items`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ title, start_date, end_date })
                });

                if (response.ok) {
                    scheduleForm.reset();
                    loadScheduledItems();
                } else {
                    alert('Failed to save schedule. Please check backend server.');
                }
            } catch (error) {
                console.error('Error adding item:', error);
                alert('Error connecting to backend server.');
            }
        });
    }
});

// Fetch schedule items from Backend API
async function loadScheduledItems() {
    const scheduleList = document.getElementById('scheduleList');
    if (!scheduleList) return;

    try {
        const response = await fetch(`${API_BASE_URL}/scheduled-items`);
        if (!response.ok) {
            throw new Error('Failed to fetch data from server.');
        }

        const items = await response.json();
        renderScheduleList(items);
    } catch (error) {
        console.error('API Error:', error);
        scheduleList.innerHTML = `
            <div class="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                Unable to load schedules. Please make sure the backend server is running.
            </div>
        `;
    }
}

// Render list of items into UI
function renderScheduleList(items) {
    const scheduleList = document.getElementById('scheduleList');
    if (!scheduleList) return;

    if (!items || items.length === 0) {
        scheduleList.innerHTML = `
            <div class="text-center py-10 text-slate-400 text-sm italic border-2 border-dashed border-slate-100 rounded-lg">
                No items found in your schedule.
            </div>
        `;
        return;
    }

    scheduleList.innerHTML = items.map(item => {
        const start = item.start_date
            ? new Date(item.start_date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
            : 'N/A';
        const end = item.end_date
            ? new Date(item.end_date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
            : 'N/A';

        return `
            <div class="p-4 bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-md rounded-xl transition duration-150 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div class="space-y-1">
                    <h3 class="font-semibold text-slate-800 text-base flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                        ${escapeHtml(item.title || 'Untitled Task')}
                    </h3>
                    <div class="text-xs text-slate-500 flex items-center gap-4">
                        <span><strong class="font-medium text-slate-600">Start:</strong> ${start}</span>
                        <span><strong class="font-medium text-slate-600">End:</strong> ${end}</span>
                    </div>
                </div>
                <div>
                    <span class="inline-block px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">
                        Scheduled
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Security: Escape HTML characters to prevent XSS
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (m) {
        return {
            '&': '&',
            '<': '<',
            '>': '>',
            '"': '"',
            "'": '''
        }[m];
    });
}