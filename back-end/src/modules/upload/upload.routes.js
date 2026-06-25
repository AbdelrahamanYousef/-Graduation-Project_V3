const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const { authUser, authAdmin } = require('../../middleware/auth');
const ApiError = require('../../shared/ApiError');

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${req.user.id}-${Date.now()}${ext}`;
        cb(null, name);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
        if (allowed.test(path.extname(file.originalname))) {
            cb(null, true);
        } else {
            cb(ApiError.badRequest('Only image files are allowed (jpg, png, gif, webp)'));
        }
    },
});

/**
 * POST /api/upload/profile-photo
 * Upload a profile photo for the authenticated user
 */
router.post('/profile-photo', authUser, (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(ApiError.badRequest('File too large. Maximum size is 5MB.'));
                }
                return next(ApiError.badRequest(err.message));
            }
            return next(err);
        }

        if (!req.file) {
            return next(ApiError.badRequest('No file uploaded'));
        }

        const photoUrl = `/uploads/${req.file.filename}`;
        res.json({ url: photoUrl, filename: req.file.filename });
    });
});

/**
 * POST /api/upload/image
 * General image upload for admin assets (programs/projects)
 */
router.post('/image', authAdmin, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(ApiError.badRequest('File too large. Maximum size is 5MB.'));
                }
                return next(ApiError.badRequest(err.message));
            }
            return next(err);
        }

        if (!req.file) {
            return next(ApiError.badRequest('No file uploaded'));
        }

        const url = `/uploads/${req.file.filename}`;
        res.json({ url, filename: req.file.filename });
    });
});

module.exports = router;
