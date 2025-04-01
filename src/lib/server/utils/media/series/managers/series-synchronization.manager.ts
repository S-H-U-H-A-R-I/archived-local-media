import { Timestamp, type DocumentReference } from "firebase-admin/firestore";

import {
    SeriesCollectionType,
    type Episode,
    type IEpisodeDocument,
    type ISeasonDocument,
    type Series,
    type ISeriesDocument,
    type SeriesMap
} from "../../models/series.models.js";
import type { FirestoreSeriesRepository } from "../repositories/firestore-series.repository.js";


export class SeriesSynchronizationManager {
    public constructor(private firestoreRepo: FirestoreSeriesRepository) { }

    /**
     * ### Synchronizes local series data with Firestore database.
     * 
     * This method processes each series in the local map and performs one of two actions:
     * 1. If the series doesn't exist in Firestore, it creates a new series record with all its seasons and episodes
     * 2. If the series exists, it updates the existing Firestore record with any changes from the local data
     * 
     * @param localSeriesMap - Map of series from the local file system
     * @param firestoreSeriesMap - Map of series from the Firestore database
     * @returns Promise that resolves when synchronization is complete
     */
    public async synchronize(
        localSeriesMap: SeriesMap,
        firestoreSeriesMap: SeriesMap
    ): Promise<void> {
        for (const [seriesName, localSeries] of Object.entries(localSeriesMap)) {
            const existingFirestoreSeries = firestoreSeriesMap[seriesName];

            if (!existingFirestoreSeries) {
                console.log(`Creating new series in Firestore: ${seriesName}`);
                const seriesRef = await this.firestoreRepo.createSeries(seriesName);
                await this.createSeasonsAndEpisodes(localSeries, seriesRef);
            } else {
                await this.updateExistingSeries(localSeries, existingFirestoreSeries);
            }
        }
    }

    /**
     * ### Creates season and episode documents in Firestore based on local series data.
     * 
     * This method iterates through the seasons in the local series data, creates a Firestore
     * document for each season in the series' "seasons" subcollection, and then creates
     * episode documents for each episode in the season.
     * 
     * @param localSeries - The local series data containing seasons and episodes
     * @param seriesRef - A reference to the Firestore document for the series
     * @returns A promise that resolves when all seasons and episodes have been created
     * 
     * @private
     */
    private async createSeasonsAndEpisodes(
        localSeries: Series,
        seriesRef: DocumentReference<ISeriesDocument>
    ): Promise<void> {
        const seasons = localSeries.seasons;

        for (const [seasonNumberStr, localSeason] of Object.entries(seasons)) {
            const seasonNumber = parseInt(seasonNumberStr, 10);

            const seasonData: ISeasonDocument = {
                season: seasonNumber,
                name: localSeason.name,
                createdAt: Timestamp.now(),
            };

            const seasonRef = await seriesRef.collection(SeriesCollectionType.SEASONS)
                .add(seasonData);

            await this.createEpisodesForSeason(localSeason.episodes, seasonRef);
        }
    }

    /**
     * ### Updates an existing series in Firestore with local series data.
     * 
     * This method compares the seasons in the local series with those in Firestore and:
     * - Creates new seasons that exist locally but not in Firestore
     * - Updates existing seasons that exist in both local and Firestore
     * 
     * @param localSeries - The local series data containing updated information
     * @param firestoreSeries - The existing series data from Firestore
     * @throws Error - If the Firestore series reference is missing
     * @returns A Promise that resolves when the update operation is complete
     */
    private async updateExistingSeries(
        localSeries: Series,
        firestoreSeries: Series
    ): Promise<void> {
        const seriesRef = firestoreSeries.ref;
        if (!seriesRef) throw new Error('Series reference is missing');
        const seasons = localSeries.seasons;

        for (const [seasonNumberStr, localSeason] of Object.entries(seasons)) {
            const seasonNumber = parseInt(seasonNumberStr, 10);
            const firestoreSeason = firestoreSeries.seasons[seasonNumber];

            if (!firestoreSeason) {
                console.log(`Creating new season ${seasonNumber} for series ${firestoreSeries.name}`);

                const seasonData: ISeasonDocument = {
                    season: seasonNumber,
                    name: localSeason.name,
                    createdAt: Timestamp.now(),
                };

                const seasonRef = await seriesRef.collection(SeriesCollectionType.SEASONS)
                    .add(seasonData);

                await this.createEpisodesForSeason(localSeason.episodes, seasonRef);
            } else {
                await this.updateExistingSeason(
                    localSeason.episodes,
                    firestoreSeason.episodes,
                    seriesRef
                );
            }
        }
    }

    /**
     * ### Creates episode documents in Firestore for a specific season.
     * 
     * @param episodes - A record mapping episode numbers to episode data.
     * @param seasonRef - A Firestore document reference pointing to the season document.
     * @returns A promise that resolves when all episodes have been created.
     * 
     * @remarks
     * **This method:**
     * 1. Iterates through each episode in the provided record
     * 2. Creates an episode document with the episode number, name, and creation timestamp
     * 3. Adds the document to the episodes subcollection of the season
     * 4. Updates the original episode object with the new document ID and reference
     */
    private async createEpisodesForSeason(
        episodes: Episode,
        seasonRef: DocumentReference<ISeasonDocument>
    ): Promise<void> {
        for (const [episodeNumberStr, episode] of Object.entries(episodes)) {
            const episodeNumber = parseInt(episodeNumberStr, 10);

            const episodeData: IEpisodeDocument = {
                episode: episodeNumber,
                name: episode.name,
                createdAt: Timestamp.now(),
            };

            const episodeRef = await seasonRef.collection(SeriesCollectionType.EPISODES)
                .add(episodeData);

            episode.id = episodeRef.id;
            episode.ref = episodeRef;
        }
    }

    /**
     * ### Updates existing season data by comparing local episodes with Firestore episodes.
     * For any local episode that doesn't exist in Firestore, it creates a new episode document.
     * 
     * @param localEpisodes - Record of episode numbers to local episode data
     * @param firestoreEpisodes - Record of episode numbers to Firestore episode data
     * @param seriesRef - Reference to the series document in Firestore
     * @returns Promise that resolves when all episodes have been processed
     */
    private async updateExistingSeason(
        localEpisodes: Episode,
        firestoreEpisodes: Episode,
        seriesRef: DocumentReference<ISeriesDocument>
    ): Promise<void> {
        for (const [episodeNumberStr, localEpisode] of Object.entries(localEpisodes)) {
            const episodeNumber = parseInt(episodeNumberStr, 10);

            if (!firestoreEpisodes[episodeNumber]) {
                console.log(
                    `Creating new episode ${episodeNumber} for season ${localEpisode.name} ` +
                    `in series ${seriesRef.id}`
                );

                const episodeData: IEpisodeDocument = {
                    episode: episodeNumber,
                    name: localEpisode.name,
                    createdAt: Timestamp.now(),
                };

                const episodeRef = await seriesRef.collection(SeriesCollectionType.EPISODES)
                    .add(episodeData);

                localEpisode.id = episodeRef.id;
                localEpisode.ref = episodeRef;
            }
        }
    }
}