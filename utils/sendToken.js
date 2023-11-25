exports.sendToken = (res, user, message, statusCode = 200) => {
    // Generate a token using the generateToken() method of the user object
    const token = user.generateToken();

    // Configure options for the token cookie
    const options = {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Set the cookie expiration time to 15 days from now
        httpOnly: true, // Make the cookie accessible only through HTTP(S) requests, not JavaScript
        secure: true, // Send the cookie only over secure (HTTPS) connections
        sameSite: "none", // Allow cross-site requests to include the cookie (required for third-party authentication)
    };

    // Set the token cookie and send the response with the token and user data
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        message,
        user,
        token
    });
};
