// API Configuration
// Central place to manage API URLs

// Base API URL for axios requests
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://skillflux-backend.vercel.app/api";

// Backend server URL for file uploads/downloads
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://skillflux-backend.vercel.app";

// Helper function to get full file URL
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  // If already a full URL, return as is
  if (filePath.startsWith('http')) return filePath;
  // Otherwise, prepend backend URL
  return `${BACKEND_URL}${filePath}`;
};
