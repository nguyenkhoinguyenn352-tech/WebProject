const API_BASE_URL = 'http://localhost:3000/api';

// Dùng đúng Client ID hiện tại của project
const GOOGLE_CLIENT_ID = '382501830356-65vgsefid73ilp0l35k2u0a5fmcd45ap.apps.googleusercontent.com';

window.addEventListener('load', () => {
    const existingToken = sessionStorage.getItem('token');

    // Nếu đã login rồi thì không cần quay lại trang login
    if (existingToken) {
        window.location.href = 'app.html';
        return;
    }

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin
    });

    google.accounts.id.renderButton(
        document.getElementById('googleSignIn'),
        {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: 320
        }
    );
});


async function handleGoogleLogin(response) {
    const loginMessage = document.getElementById('loginMessage');

    try {
        loginMessage.textContent = 'Signing in...';

        const backendResponse = await fetch(
            `${API_BASE_URL}/auth/google`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    credential: response.credential
                })
            }
        );

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            loginMessage.textContent =
                data.error || 'Login failed';

            return;
        }

        sessionStorage.setItem(
            'token',
            data.token
        );

        sessionStorage.setItem(
            'user',
            JSON.stringify(data.user)
        );

        loginMessage.textContent =
            `Welcome ${data.user.name}`;

        window.location.href = 'app.html';

    } catch (error) {
        console.error('Login error:', error);

        loginMessage.textContent =
            'Cannot connect to backend server';
    }
}