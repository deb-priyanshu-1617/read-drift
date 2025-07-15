// Profile page logic (for future Firebase integration)
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const username = document.querySelector('.profile-username');
    const email = document.querySelector('.profile-email');

    // Placeholder: Not logged in
    loginBtn.addEventListener('click', () => {
        window.location.href = 'auth.html';
    });
    logoutBtn.addEventListener('click', () => {
        alert('Logout coming soon!');
    });
});
