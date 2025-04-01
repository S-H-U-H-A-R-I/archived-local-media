import fs from 'node:fs';
import path from 'node:path';

import { VIDEO_EXTENSIONS } from './constants.js';


/**
 * ### Gets all directories within the specified path
 * @param {string} directoryPath - Path to search for directories
 * @returns {Promise<string[]>} Promise resolving to array of directory names
 */
export const getDirectories = async (directoryPath: string): Promise<string[]> => {
    try {
        const items = await fs.promises.readdir(directoryPath, { withFileTypes: true });
        return items
            .filter((dirent: fs.Dirent) => dirent.isDirectory())
            .map((dirent: fs.Dirent) => dirent.name);
    } catch (error) {
        console.error(`Error reading directories in ${directoryPath}:`, error);
        return [];
    }
};

/**
 * ### Gets all media files within the specified directory
 * @param {string} directoryPath - Path to search for media files
 * @param {string} mediaType - Type of media files to search for (e.g., 'video', 'audio', 'image')
 * @returns {Promise<string[]>} Promise resolving to array of media file names
 */
export const getMediaFiles = async (
    directoryPath: string, mediaType: "video" = "video"
): Promise<string[]> => {
    const files = await fs.promises.readdir(directoryPath);
    let mediaExtensions: string[];

    switch (mediaType.toLowerCase()) {
        case 'video':
            mediaExtensions = [...VIDEO_EXTENSIONS];
            break;
        default:
            mediaExtensions = [];
    }

    return files.filter((file: string) => {
        const extension = path.extname(file);
        return mediaExtensions.includes(extension);
    });
};