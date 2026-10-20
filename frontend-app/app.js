// URL của Backend API do Đạt viết
const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const scheduleForm = document.getElementById('scheduleForm');
    const scheduleList = document.getElementById('scheduleList');

    // 1. Hàm tải danh sách công việc từ Backend (/api/scheduled-items)
    async function loadScheduledItems() {
        try {
            const response = await fetch(`${API_BASE_URL}/scheduled-items`);
            if (!response.ok) {
                throw new Error('Lỗi khi tải dữ liệu từ máy chủ.');
            }

            const items = await response.json();
            renderScheduleList(items);
        } catch (error) {
            console.error('Lỗi API:', error);
            scheduleList.innerHTML = `<div class="empty-msg" style="color: #e74c3c;">Không thể tải danh sách. Hãy đảm bảo Backend (server.js) đang chạy tại port 3000.</div>`;
        }
    }

    // 2. Hàm hiển thị danh sách công việc lên giao diện
    function renderScheduleList(items) {
        if (!items || items.length === 0) {
            scheduleList.innerHTML = '<div class="empty-msg">Chưa có công việc nào trong lịch trình.</div>';
            return;
        }

        scheduleList.innerHTML = items.map(item => {
            const start = item.start_date ? new Date(item.start_date).toLocaleString('vi-VN') : 'Không xác định';
            const end = item.end_date ? new Date(item.end_date).toLocaleString('vi-VN') : 'Không xác định';

            return `
                <div class="item-card">
                    <div class="item-info">
                        <h3>${escapeHtml(item.title)}</h3>
                        <span class="item-badge">${escapeHtml(item.item_type || 'Task')}</span>
                        <p>🕒 Bắt đầu: ${start}</p>
                        <p>🏁 Kết thúc: ${end}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 3. Hàm xử lý gửi form tạo công việc mới (POST /api/scheduled-items)
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newItem = {
                user_id: parseInt(document.getElementById('user_id').value, 10),
                title: document.getElementById('title').value.trim(),
                item_type: document.getElementById('item_type').value,
                start_date: document.getElementById('start_date').value,
                end_date: document.getElementById('end_date').value
            };

            try {
                const response = await fetch(`${API_BASE_URL}/scheduled-items`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newItem)
                });

                if (response.ok) {
                    scheduleForm.reset();
                    // Reset mặc định User ID về 1
                    document.getElementById('user_id').value = "1";
                    // Tải lại danh sách sau khi thêm thành công
                    await loadScheduledItems();
                } else {
                    const errData = await response.json();
                    alert(`Lỗi khi tạo công việc: ${errData.error || 'Vui lòng kiểm tra lại dữ liệu.'}`);
                }
            } catch (error) {
                console.error('Lỗi khi gửi dữ liệu:', error);
                alert('Không thể gửi request tới máy chủ!');
            }
        });
    }

    // Hàm chống lỗi XSS cho chuỗi văn bản
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Tải dữ liệu ban đầu ngay khi mở trang
    loadScheduledItems();
});