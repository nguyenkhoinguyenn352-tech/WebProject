import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../models/userModel.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        // Frontend phải gửi Google credential lên
        if (!credential) {
            return res.status(400).json({
                error: 'Google credential is required'
            });
        }
        // Xác minh token với Google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        // Kiểm tra email từ Google
        if (!payload || !payload.email || !payload.email_verified) {
            return res.status(401).json({
                error: 'Google account could not be verified'
            });
        }

        // Tìm user trong database bằng email
        const user = await findUserByEmail(payload.email);

        if (!user) {
            return res.status(403).json({
                error: 'This Google account is not registered'
            });
        }

        // Tạo token riêng của Work Logger
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        return res.status(200).json({
            message: 'Login successful',
            token: token,
            user: {
                user_id: user.user_id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });


    } catch (error) {
        console.error('Google login error:', error);

        return res.status(401).json({
            error: 'Google login failed'
        });
    }
};

const getCurrentUser = async (req, res) => {
    return res.status(200).json({
        user: req.user
    });
};

export {
    googleLogin,
    getCurrentUser
};