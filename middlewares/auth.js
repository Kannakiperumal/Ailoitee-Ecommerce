const JWT = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Access Denied. No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token
    console.log("Extracted Token:", token); // Log extracted token

    try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET_KEY);
        console.log("Decoded Token:", decoded); // Log decoded token
        
        req.user = decoded; // Attach user to request object
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
};



const authorizeRole = (role) => {
    return (req, res, next) => {
        console.log("User Role:", req.user.role);  // <-- Debugging log

        if (!req.user || req.user.role !== role) {
            console.error(`Access Denied. Expected: ${role}, Found: ${req.user?.role}`);
            return res.status(403).json({ message: "Access Denied. Insufficient permissions" });
        }
        next();
    };
};



module.exports = { authenticate, authorizeRole };
