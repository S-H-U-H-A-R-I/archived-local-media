export const getSeasonName = (seriesName: string, seaosnNumber: number): string => {
    return `${seriesName} - Season ${seaosnNumber}`;
};

export const getEpisodeName = (
    seriesName: string,
    seasonNumber: number,
    episodeNumber: number
): string => {
    return `${seriesName} ` +
        `S${seasonNumber.toString().padStart(2, '0')}` +
        `E${episodeNumber.toString().padStart(2, '0')}`;
};