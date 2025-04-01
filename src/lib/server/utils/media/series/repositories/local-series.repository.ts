import path from "node:path";

import { LOCAL_DIRECTORIES } from "$lib/server/config/index.js";

import { getDirectories, getMediaFiles } from "../../common/index.js";
import type { IConversionCandidate, Series, SeriesMap } from "../../models/index.js";
import { EPISODE_NUMBER_REGEX, SEASON_NUMBER_REGEX } from "../series.constants.js";
import { getEpisodeName, getSeasonName } from "../utils/naming.utils.js";
import { VideoExtensions } from "../../models/shared.models.js";


export class LocalSeriesRepository {
    #conversionCandidates: IConversionCandidate[] = [];

    public get conversionCandidates(): IConversionCandidate[] {
        return [...this.#conversionCandidates];
    }

    /**
     * ### Retrieves all series from the local repository.
     * 
     * This method fetches all series data and organizes it into a map structure
     * where each series is accessible by its unique identifier.
     * 
     * @returns A promise that resolves to an ISeriesMap containing all series data
     */
    public async getAllSeries(): Promise<SeriesMap> {
        this.#conversionCandidates = [];
        const seriesMap: SeriesMap = {};
        await this.populateSeries(seriesMap);
        return seriesMap;
    }

    /**
     * ### Populates the series map with series and their seasons from the local file system.
     * 
     * This method reads the series directories from the configured SERIES_DIR,
     * creates an entry for each series in the provided series map, and then
     * populates the seasons for each series by calling populateSeasons.
     * 
     * @param seriesMap - An object mapping series names to their details
     * @returns A promise that resolves when all series and their seasons have been populated
     */
    private async populateSeries(seriesMap: SeriesMap): Promise<void> {
        const seriesDir = LOCAL_DIRECTORIES.SERIES_DIR;
        const seriesFolders = await getDirectories(seriesDir);

        for (const seriesName of seriesFolders) {
            const seriesPath = path.join(seriesDir, seriesName);
            seriesMap[seriesName] = { name: seriesName, seasons: {} };

            await this.populateSeasons(seriesMap[seriesName], seriesPath);
        }
    }

    /**
     * ### Populates a series object with seasons found in the series directory.
     * 
     * This method scans the provided series path for season folders, extracts the
     * season number from each folder name using SEASON_NUMBER_REGEX, and creates
     * corresponding season entries in the series object. For each valid season folder,
     * it also populates the episodes within that season.
     * 
     * @param series - The series object to populate with seasons
     * @param seriesPath - The file system path to the series directory
     * @returns A promise that resolves when all seasons and their episodes have been populated
     */
    private async populateSeasons(series: Series, seriesPath: string): Promise<void> {
        const seasonFolders = await getDirectories(seriesPath);

        for (const seasonFolder of seasonFolders) {
            const seasonMatch = seasonFolder.match(SEASON_NUMBER_REGEX);
            if (!seasonMatch) continue;

            const seasonNumber = parseInt(seasonMatch[1], 10);
            const seasonPath = path.join(seriesPath, seasonFolder);

            series.seasons[seasonNumber] = {
                name: getSeasonName(series.name, seasonNumber),
                localPath: seasonPath,
                episodes: {},
            };

            await this.populateEpisodes(series, seasonNumber, seasonPath);
        }
    }

    /**
     * ### Populates the episodes for a given season of a series.
     * 
     * This method scans the provided season path for video files,
     * extracts episode numbers using the EPISODE_NUMBER_REGEX,
     * and adds episode information to the series object.
     * 
     * @param series - The series object to be populated with episodes
     * @param seasonNumber - The number of the season to populate
     * @param seasonPath - The file system path where season episodes are located
     * @returns A Promise that resolves when all episodes are populated
     */
    private async populateEpisodes(
        series: Series,
        seasonNumber: number,
        seasonPath: string
    ): Promise<void> {
        const episodeFiles = await getMediaFiles(seasonPath, 'video');

        for (const episodeFile of episodeFiles) {
            const episodeMatch = episodeFile.match(EPISODE_NUMBER_REGEX);
            if (!episodeMatch) continue;

            const episodeNumber = parseInt(episodeMatch[1], 10);
            series.seasons[seasonNumber].episodes[episodeNumber] = {
                name: getEpisodeName(series.name, seasonNumber, episodeNumber),
            };

            const fileExtension = path.extname(episodeFile).toLowerCase();
            if (fileExtension !== VideoExtensions.MP4) {
                const filePath = path.join(seasonPath, episodeFile);
                this.#conversionCandidates.push({
                    seriesName: series.name,
                    seasonNumber,
                    episodeNumber,
                    filePath,
                    originalFormat: fileExtension,
                    trargetFormat: VideoExtensions.MP4,
                });
            }
        }
    }
}