export const VIDEO_EXTENSIONS = [
    ".mp4",
    ".mkv",
    ".avi",
    ".mov",
    ".wmv",
    ".m4v",
] as const;

export const DEFAULT_METADATA_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

export const CONCURRENT_FFPROBE_LIMIT = 5;

export const METADATA_CACHE_FILE = ".metadata-cache.json";
