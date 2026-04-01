const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Create upload directories if they don't exist
const createDirIfNotExist = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

createDirIfNotExist('uploads');
createDirIfNotExist('uploads/users');
createDirIfNotExist('uploads/produk');
createDirIfNotExist('uploads/reviews');
createDirIfNotExist('uploads/postingan');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'uploads/';
        if (file.fieldname === 'avatar') folder += 'users/';
        else if (file.fieldname === 'product_image') folder += 'produk/';
        else if (file.fieldname === 'review_image') folder += 'reviews/';
        else if (file.fieldname === 'postingan_image') folder += 'postingan/';
        else folder += 'others/';
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only images and videos are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter
});

module.exports = upload;
