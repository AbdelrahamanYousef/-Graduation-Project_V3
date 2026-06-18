const { ZodError } = require('zod');

/**
 * Middleware factory that validates request body/query/params against a Zod schema
 * @param {Object} schemas - { body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }
 */
function validate(schemas) {
    return (req, res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }
            next();
        } catch (err) {
            next(err); // errorHandler handles ZodError
        }
    };
}

module.exports = validate;
