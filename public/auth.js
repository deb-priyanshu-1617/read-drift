// Authentication page logic
document.addEventListener('DOMContentLoaded', () => {
    const authTitle = document.getElementById('authTitle');
    const authForm = document.getElementById('authForm');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const submitBtn = document.getElementById('submitBtn');
    const switchText = document.getElementById('switchText');
    const switchBtn = document.getElementById('switchBtn');

    let isLoginMode = true;

    // Switch between login and signup modes
    switchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        
        if (isLoginMode) {
            authTitle.textContent = 'Login';
            submitBtn.textContent = 'Login';
            switchText.textContent = 'Don\'t have an account? ';
            switchBtn.textContent = 'Sign Up';
        } else {
            authTitle.textContent = 'Sign Up';
            submitBtn.textContent = 'Sign Up';
            switchText.textContent = 'Already have an account? ';
            switchBtn.textContent = 'Login';
        }
    });

    // Handle form submission
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        // Simulate authentication 
        if (isLoginMode) {
            // Login logic
            console.log('Logging in with:', email);
            alert('Login functionality coming soon!');
        } else {
            // Signup logic
            console.log('Signing up with:', email);
            alert('Sign up functionality coming soon!');
        }
    });
}); 