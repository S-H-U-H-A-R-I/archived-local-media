import firestoreService from "$lib/server/db/firestore.service.js";
import { Timestamp, type DocumentReference } from "firebase-admin/firestore";

import { SeriesCollectionType, type IEpisodeDocument, type ISeasonDocument, type ISeriesDocument, type SeriesMap } from "../../models/series.models.js";
import { getEpisodeName, getSeasonName } from "../utils/naming.utils.js";


export class FirestoreSeriesRepository {
    /**
     * ### Retrieves all series from the Firestore database.
     * 
     * @returns A promise that resolves to an ISeriesMap object containing all series.
     * The map uses series IDs as keys and series objects as values.
     */
    public async getAllSeries(): Promise<SeriesMap> {
        const seriesMap: SeriesMap = {};
        await this.populateSeries(seriesMap);
        return seriesMap;
    }

    /**
     * ### Creates a new series in the Firestore database.
     * 
     * @param seriesName - The name of the series to create
     * @returns A Promise that resolves to a DocumentReference for the newly created series
     * @throws May throw errors if Firestore write operations fail
     */
    public async createSeries(seriesName: string): Promise<DocumentReference<ISeriesDocument>> {
        return await firestoreService.addDocument<ISeriesDocument>(
            SeriesCollectionType.SERIES,
            {
                name: seriesName,
                createdAt: Timestamp.now()
            }
        );
    }

    /**
     * ### Populates a series map with data from Firestore.
     * 
     * This method retrieves all series documents from the Firestore collection,
     * processes each document to extract the series ID and name, and adds the 
     * series to the provided map. It also populates the seasons for each series.
     * Series without a name are skipped and logged as warnings.
     *
     * @param seriesMap - The map to populate with series data, where keys are series names
     * @returns A promise that resolves when all series and their seasons have been populated
     */
    private async populateSeries(seriesMap: SeriesMap): Promise<void> {
        const series = await firestoreService
            .getCollection<ISeriesDocument>(SeriesCollectionType.SERIES);

        for (const seriesDoc of series) {
            const seriesId = seriesDoc.id;
            const seriesName = seriesDoc.name;

            if (!seriesName) {
                console.warn(`Series document ${seriesId} has no name. Skipping...`);
                continue;
            }

            seriesMap[seriesName] = {
                id: seriesId,
                ref: seriesDoc.ref,
                name: seriesName,
                seasons: {}
            };

            await this.populateSeasons(seriesMap[seriesName], seriesDoc.ref);
        }

    }

    /**
     * ### Populates the seasons and episodes for a given series.
     * 
     * This method retrieves all season documents from Firestore for the provided series,
     * processes each valid season, and adds it to the series object. It also calls
     * `populateEpisodes` to populate the episodes for each season.
     * 
     * @param series - The series object to populate with seasons and episodes
     * @param seriesRef - A Firestore document reference to the series
     * @returns A promise that resolves when all seasons and episodes have been populated
     * 
     * @remarks
     * - Seasons with null or invalid (< 1) season numbers will be skipped and logged
     * - The season name is automatically generated as "{series name} Season {number}"
     */
    private async populateSeasons(
        series: SeriesMap[string],
        seriesRef: DocumentReference<ISeriesDocument>
    ): Promise<void> {
        const seasonsSnapshot = await seriesRef.collection(SeriesCollectionType.SEASONS)
            .withConverter(firestoreService.getConverter<ISeasonDocument>())
            .get();

        for (const seasonDoc of seasonsSnapshot.docs) {
            const seasonId = seasonDoc.id;
            const season = seasonDoc.data().season;

            if (season == null || season < 1) {
                console.warn(
                    'Skipping season with invalid season number in ' +
                    `series "${series.name}"`
                );
                continue;
            }

            series.seasons[season] = {
                id: seasonId,
                ref: seasonDoc.ref,
                name: getSeasonName(series.name, season),
                episodes: {}
            };
            await this.populateEpisodes(series, seasonDoc.ref, season);
        }
    }

    /**
     * ### Populates the episodes for a specific season of a series.
     * 
     * This method retrieves all episodes from the specified season reference,
     * validates each episode's number, and adds valid episodes to the series' 
     * season episodes map.
     * 
     * @param series - The series object to populate episodes for
     * @param seasonRef - Firestore document reference to the season
     * @param season - The season number
     * @returns A Promise that resolves when all episodes have been populated
     * 
     * @remarks
     * Episodes with invalid episode numbers (null or less than 1) will be skipped
     * with a warning logged to the console.
     */
    private async populateEpisodes(
        series: SeriesMap[string],
        seasonRef: DocumentReference<ISeasonDocument>,
        season: number
    ): Promise<void> {
        const episodesSnapshot = await seasonRef.collection(SeriesCollectionType.EPISODES)
            .withConverter(firestoreService.getConverter<IEpisodeDocument>())
            .get();

        for (const episodeDoc of episodesSnapshot.docs) {
            const episodeId = episodeDoc.id;
            const episode = episodeDoc.data().episode;

            if (episode == null || episode < 1) {
                console.warn(
                    'Skipping episode with invalid episode number in ' +
                    `season ${season} of series "${series.name}"`
                );
                continue;
            }

            series.seasons[season].episodes[episode] = {
                id: episodeId,
                ref: episodeDoc.ref,
                name: getEpisodeName(series.name, season, episode)
            };
        }
    }
}