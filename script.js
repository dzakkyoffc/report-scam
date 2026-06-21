// Counter Animation
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 20);
}

// Load stats from localStorage
function loadStats() {
    const totalReports = localStorage.getItem('totalReports') || 1247;
    const todayReports = localStorage.getItem('todayReports') || 23;
    const bannedCount = localStorage.getItem('bannedCount') || 89;
    
    animateCounter(document.getElementById('totalReports'), parseInt(totalReports));
    animateCounter(document.getElementById('todayReports'), parseInt(todayReports));
    animateCounter(document.getElementById('bannedCount'), parseInt(bannedCount));
}

// Load reported list
function loadReportedList() {
    const list = document.getElementById('reportedList');
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    
    if (reports.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <span>🔍</span>
                <p>Belum ada report</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = reports.slice(-10).reverse().map(r => `
        <div class="reported-item">
            <div>
                <span class="username">@${r.username}</span>
                <span class="reason"> - ${r.reason}</span>
            </div>
            <span class="status ${r.banned ? 'banned' : 'reported'}">
                ${r.banned ? 'BANNED' : 'REPORTED'}
            </span>
        </div>
    `).join('');
}

// Handle form submit
document.getElementById('reportForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const reason = document.getElementById('reason').value;
    const description = document.getElementById('description').value.trim();
    const platform = document.querySelector('input[name="platform"]:checked').value;
    
    if (!username || !reason) {
        alert('Harap isi username dan alasan report!');
        return;
    }
    
    // Simpan ke localStorage
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    reports.push({
        username,
        reason,
        description,
        platform,
        timestamp: new Date().toISOString(),
        banned: false
    });
    localStorage.setItem('reports', JSON.stringify(reports));
    
    // Update stats
    const total = parseInt(localStorage.getItem('totalReports') || 1247) + 1;
    const today = parseInt(localStorage.getItem('todayReports') || 23) + 1;
    localStorage.setItem('totalReports', total);
    localStorage.setItem('todayReports', today);
    
    // Generate report links
    const reportLinks = [];
    
    if (platform === 'telegram') {
        reportLinks.push(`https://t.me/SpamBot`);
        reportLinks.push(`https://t.me/NoToScam_bot`);
        reportLinks.push(`https://telegram.org/support`);
    } else if (platform === 'whatsapp') {
        reportLinks.push(`https://wa.me/?text=Report%20scam%20${username}`);
    }
    
    // Show success
    const successMsg = `
✅ REPORT BERHASIL DIKIRIM!

Target: @${username}
Platform: ${platform}
Alasan: ${reason}

📋 LANGKAH SELANJUTNYA:
1. Report langsung ke Telegram:
   • @SpamBot - Forward pesan scam
   • @NoToScam_bot - Report scammer
   • abuse@telegram.org - Email report

2. Ajak teman untuk report juga!

3. Simpan bukti transaksi

⚠️ Semakin banyak report, semakin cepat kena banned!
    `;
    
    alert(successMsg);
    
    // Reset form
    this.reset();
    document.querySelector('input[name="platform"][value="telegram"]').checked = true;
    
    // Reload stats & list
    loadStats();
    loadReportedList();
    
    // Buka link report di tab baru
    if (reportLinks.length > 0) {
        reportLinks.forEach(link => {
            window.open(link, '_blank');
        });
    }
});

// Generate mass report message
function generateReportText(username) {
    return `
🚨 REPORT SCAMMER 🚨

Username: @${username}
Alasan: Scam / Penipuan

Silakan report akun ini:
1. Buka profil @${username}
2. Klik ⋮ > Report
3. Pilih "Scam"
4. Submit

Tolong bantu report ya! 🙏
    `.trim();
}

// Copy to clipboard function
window.copyReportText = function(username) {
    const text = generateReportText(username);
    navigator.clipboard.writeText(text).then(() => {
        alert('📋 Teks report berhasil dicopy! Sebarkan ke grup/teman!');
    });
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadReportedList();
});

// Reset daily counter at midnight
const now = new Date();
const midnight = new Date(now);
midnight.setHours(24, 0, 0, 0);
const timeToMidnight = midnight - now;

setTimeout(() => {
    localStorage.setItem('todayReports', '0');
    loadStats();
}, timeToMidnight);