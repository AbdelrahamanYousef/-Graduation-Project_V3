const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authUser, authAdmin } = require('../../middleware/auth');
const ApiError = require('../../shared/ApiError');

const router = Router();

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${req.user ? req.user.id : 'anon'}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(ApiError.badRequest('Only image files are allowed (jpg, png, gif, webp)'));
  },
});

const cvUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.pdf$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(ApiError.badRequest('Only PDF files are allowed (.pdf)'));
  },
});

router.post('/profile-photo', authUser, (req, res, next) => {
  imageUpload.single('photo')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return next(ApiError.badRequest('File too large. Maximum size is 5MB.'));
        return next(ApiError.badRequest(err.message));
      }
      return next(err);
    }
    if (!req.file) return next(ApiError.badRequest('No file uploaded'));
    res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
  });
});

router.post('/image', authAdmin, (req, res, next) => {
  imageUpload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return next(ApiError.badRequest('File too large. Maximum size is 5MB.'));
        return next(ApiError.badRequest(err.message));
      }
      return next(err);
    }
    if (!req.file) return next(ApiError.badRequest('No file uploaded'));
    res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
  });
});

router.post('/cv', (req, res, next) => {
  cvUpload.single('cv')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return next(ApiError.badRequest('File too large. Maximum size is 5MB.'));
        return next(ApiError.badRequest(err.message));
      }
      return next(err);
    }
    if (!req.file) return next(ApiError.badRequest('No file uploaded'));
    res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
  });
});

router.post('/cv-public', (req, res, next) => {
  cvUpload.single('cv')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return next(ApiError.badRequest('File too large. Maximum size is 5MB.'));
        return next(ApiError.badRequest(err.message));
      }
      return next(err);
    }
    if (!req.file) return next(ApiError.badRequest('No file uploaded'));
    res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
  });
});

router.post('/cv-auth', authUser, (req, res, next) => {
  cvUpload.single('cv')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return next(ApiError.badRequest('File too large. Maximum size is 5MB.'));
        return next(ApiError.badRequest(err.message));
      }
      return next(err);
    }
    if (!req.file) return next(ApiError.badRequest('No file uploaded'));
    res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
  });
});

module.exports = router;
