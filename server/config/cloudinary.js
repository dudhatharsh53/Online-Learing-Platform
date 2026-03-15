const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for video uploads
const videoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'lms/videos',
        resource_type: 'video', // Allow video uploads
        allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    },
});

// Storage for PDF / document uploads
const pdfStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'lms/pdfs',
        resource_type: 'raw', // PDFs are treated as raw files
        allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
    },
});

// Storage for image thumbnails
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'lms/thumbnails',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 450, crop: 'fill' }], // 16:9 thumbnail
    },
});

// Multer upload instances
const uploadVideo = multer({ storage: videoStorage });
const uploadPDF = multer({ storage: pdfStorage });
const uploadImage = multer({ storage: imageStorage });

// Combined uploader for lecture: accepts video and pdf fields
const uploadLecture = multer({
    storage: multer.memoryStorage(), // We'll handle upload manually for mixed types
});

module.exports = {
    cloudinary,
    uploadVideo,
    uploadPDF,
    uploadImage,
    uploadLecture,
};
