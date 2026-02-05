const axios = require('axios');
const jwt = require('jsonwebtoken');
const admin = require('../services/firebaseService');

// In-memory OTP Store (Production: Use Redis)
// Key: mobile_number ("+919876543210")
// Value: { otp: "123456", expiresAt: <timestamp>, attempts: 0, lastSent: <timestamp> }
const otpStore = new Map();

// Helper: Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOtp = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile) return res.status(400).json({ error: 'Mobile number required' });

        const now = Date.now();
        const record = otpStore.get(mobile);

        // Rate Limit: 1 OTP per 60 seconds
        if (record && now - record.lastSent < 60000) {
            return res.status(429).json({ error: 'Please wait 1 minute before resending OTP.' });
        }

        // Daily Limit Logic (Simplified for memory store)
        // In a real app, this should be in a DB to persist across restarts.
        // For now, we reset attempts if the record is expired and cleaned up, 
        // or we can keep a separate "attempts" map if needed. 
        // We'll trust the expiry cleanup for now to clear "session" attempts.

        const otp = generateOTP();
        const expiresAt = now + 5 * 60 * 1000; // 5 minutes from now

        const apiKey = process.env.FAST2SMS_API_KEY;
        let sent = false;

        if (apiKey) {
            // Fast2SMS: Quick SMS API (Route "q")
            const cleanNumber = mobile.replace('+91', '').trim();

            try {
                await axios.post("https://www.fast2sms.com/dev/bulkV2", {
                    route: "q",
                    message: `Your Transporter login OTP is ${otp}. Valid for 5 minutes.`,
                    numbers: cleanNumber
                }, {
                    headers: {
                        "authorization": apiKey,
                        "Content-Type": "application/json"
                    }
                });
                sent = true;
            } catch (smsError) {
                const providerError = smsError.response?.data?.message || smsError.message;
                console.error("Fast2SMS Failed:", smsError.response ? smsError.response.data : smsError.message);

                return res.status(500).json({
                    error: `SMS Provider Error: ${providerError}`
                });
            }
        } else {
            // Development Mock
            console.log(`[DEV MODE] Mock OTP for ${mobile}: ${otp}`);
        }

        if (sent) {
            otpStore.set(mobile, {
                otp,
                expiresAt,
                lastSent: now,
                attempts: (record?.attempts || 0) + 1
            });
            return res.json({ success: true, message: 'OTP sent successfully' });
        }

    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const db = require('../database/db'); // Import MySQL connection

exports.verifyOtp = async (req, res) => {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) return res.status(400).json({ error: 'Mobile and OTP required' });

    const record = otpStore.get(mobile);

    if (!record) {
        return res.status(400).json({ error: 'No OTP requested or OTP expired' });
    }

    if (Date.now() > record.expiresAt) {
        otpStore.delete(mobile);
        return res.status(400).json({ error: 'OTP expired' });
    }

    if (record.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Success
    otpStore.delete(mobile);

    try {
        let uid = mobile; // Default UID for stateless fallback
        let user = { mobile, role: 'user' };

        // 1. Persist User in MySQL (Alternative to Firestore)
        try {
            // Check if user exists
            const [rows] = await db.query('SELECT * FROM users WHERE mobile = ?', [mobile]);

            if (rows.length > 0) {
                user = rows[0];
                uid = user.id.toString();
            } else {
                // Create new user
                const [result] = await db.query('INSERT INTO users (mobile) VALUES (?)', [mobile]);
                user = { id: result.insertId, mobile, role: 'user' };
                uid = result.insertId.toString();
            }
        } catch (dbError) {
            console.error("MySQL Error (Ignored/Fallback):", dbError.message);
            // Fallback: If MySQL fails, we still allow login but sans DB persistence
            // UID will be the mobile number
        }

        // 2. Generate Firebase Custom Token (for Client Maps/Auth)
        // Works even without Firestore!
        const firebaseCustomToken = await admin.auth().createCustomToken(uid);

        // 3. Generate Backend JWT (for API routes protection)
        const jwtToken = jwt.sign(
            { id: uid, mobile },
            process.env.JWT_SECRET || 'dev_secret_change_me',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'OTP verified',
            token: jwtToken,
            firebaseToken: firebaseCustomToken,
            user: { id: uid, ...user }
        });

    } catch (err) {
        console.error('Verify OTP / User Creation Error:', err);
        // Returns 500 but now likely succeeds via MySQL or Stateless
        res.status(500).json({ error: err.message || 'Verification failed' });
    }
};
