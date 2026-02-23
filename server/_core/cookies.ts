// Session Cookie Options Configuration

const sessionCookieOptions = {
    httpOnly: true, // The cookie cannot be accessed via JavaScript
    secure: process.env.NODE_ENV === 'production', // Send cookie only over HTTPS in production
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: 'strict', // Protects against CSRF
};

export default sessionCookieOptions;