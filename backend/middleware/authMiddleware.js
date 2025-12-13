import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_do_not_use_in_production");
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid token." });
    }
};

export default authMiddleware;
