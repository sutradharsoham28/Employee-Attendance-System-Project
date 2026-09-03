const hrMiddleware = (req, res, next) => {

    if (req.user.role !== "hr") {
        return res.status(403).json({
            message: "Access denied. HR only."
        });
    }

    next();

};

module.exports = hrMiddleware;