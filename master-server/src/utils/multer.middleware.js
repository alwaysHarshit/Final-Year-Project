import multer from 'multer';
import path from 'path';

// Use diskStorage to control destination and filenames
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join('../../shared/dataset'));
    },
    filename: (req, file, cb) => {
        const jobId = req.body.jobId || Date.now();
        const ext = path.extname(file.originalname);
        const base = path
            .parse(file.originalname)
            .name.replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeFileName = `${base}_${jobId}${ext}`;
        cb(null, safeFileName);
    },
});

//multer middleware
export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed!'));
        }
    },
});
