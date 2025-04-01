import type { IConversionCandidate, IConvertEpisodesResponse, Series, TSeries } from "../../models/series.models.js";
import { SeriesSynchronizationManager } from "../managers/series-synchronization.manager.js";
import { SeriesTransformerManager } from "../managers/series-transformer.manager.js";
import { FirestoreSeriesRepository } from "../repositories/firestore-series.repository.js";
import { LocalSeriesRepository } from "../repositories/local-series.repository.js";
import { DEFAULT_CACHE_DURATION } from "../series.constants.js";


export class SeriesService {
    readonly #firestoreRepo: FirestoreSeriesRepository;
    readonly #localRepo: LocalSeriesRepository;
    readonly #syncManager: SeriesSynchronizationManager;
    readonly #transformer: SeriesTransformerManager;

    #cachedSeries: TSeries[] | null = null;
    #cachedTimestamp: number = 0;
    readonly #cachedDuration: number = DEFAULT_CACHE_DURATION;
    #conversionCanditates: IConversionCandidate[] = [];

    public constructor() {
        this.#firestoreRepo = new FirestoreSeriesRepository();
        this.#localRepo = new LocalSeriesRepository();
        this.#syncManager = new SeriesSynchronizationManager(this.#firestoreRepo);
        this.#transformer = new SeriesTransformerManager();
    }

    /**
     * ### Retrieves all series from both local and Firestore repositories.
     * 
     * This method attempts to synchronize the local repository with Firestore,
     * then returns a combined list of series from both sources. If synchronization fails,
     * it falls back to returning the available data without synchronization.
     * 
     * If cached data is available and not expired, and refresh is not requested,
     * the cached data will be returned instead of re-fetching.
     * 
     * @param {boolean} refresh - Whether to force refresh the data, ignoring cache.
     * @returns {Promise<TSeries[]>} A promise that resolves to an array of transformed series objects.
     */
    public async getSeries(refresh: boolean = false): Promise<TSeries[]> {
        const currentTime = Date.now();
        const isCacheExpired = (currentTime - this.#cachedTimestamp) > this.#cachedDuration;

        if (!refresh && !isCacheExpired && this.#cachedSeries !== null) {
            console.log('Returning cached series data.');
            return this.#cachedSeries;
        }

        try {
            const series = await this.fetchAndSyncSeries();

            this.#cachedSeries = series;
            this.#cachedTimestamp = currentTime;

            return series;
        } catch (error) {
            console.error('Error fetching series data:', error);

            if (this.#cachedSeries !== null) {
                console.log('Falling back to cached data due to error');
                return this.#cachedSeries;
            }

            throw error;
        }
    }

    /**
     * ### Retrieves a series by its ID.
     * 
     * @param {string} seriesId - The unique identifier of the series to retrieve
     * @param {boolean} refresh - Whether to force a refresh of the cached series data. Defaults to false
     * @returns {Promise<TSeries | undefined>}
     *  A Promise that resolves to the found series object, or undefined if no series with the given ID exists
     */
    public async getSeriesById(
        seriesId: string,
        refresh: boolean = false
    ): Promise<TSeries | undefined> {
        if (refresh || this.#cachedSeries === null) await this.getSeries(refresh);

        return this.#cachedSeries?.find((series) => series.id === seriesId);
    }

    /**
     * ### Retrieves a list of conversion candidates for series.
     * 
     * This method returns the currently cached conversion candidates. If the cache is empty,
     * it will first call `getSeries(true)` to retrieve series information and then
     * populate the cache with conversion candidates from the local repository.
     * 
     * @returns A promise that resolves to an array of conversion candidate objects
     */
    public async getConversionCandidates(): Promise<IConversionCandidate[]> {
        if (this.#conversionCanditates.length === 0) {
            await this.getSeries(true);
            this.#conversionCanditates = this.#localRepo.conversionCandidates;
        }

        return this.#conversionCanditates;
    }

    public async convertEpisode(filePaths?: string[]): Promise<IConvertEpisodesResponse> {
        const response: IConvertEpisodesResponse = {
            success: false,
            converted: 0,
            failed: 0,
            messages: [] as string[]
        };
        const candidates = await this.getConversionCandidates();
        const toConvert = filePaths
            ? candidates.filter((candidate) => filePaths.includes(candidate.filePath))
            : candidates;

        if (toConvert.length === 0) {
            response.success = true;
            response.messages.push('No files to convert.');
            return response;
        }

        console.warn(`Implement convert episode logic here.`);

        response.success = true;
        response.converted = toConvert.length;
        response.messages.push(`Converted ${toConvert.length} files.`);
        return response;
    }

    /**
     * ### Fetches series data from local and Firestore repositories and synchronizes them.
     * 
     * **This method performs the following operations:**
     * 1. Retrieves all series from both local and Firestore repositories
     * 2. Synchronizes the data between these repositories
     * 3. Fetches the updated Firestore data after synchronization
     * 4. Combines and transforms the series data
     * 
     * **If synchronization fails, it falls back to using the original Firestore data.**
     * 
     * @returns {Promise<TSeries[]>} A promise that resolves to an array of transformed series objects
     * @throws {Error} Logs but does not throw errors encountered during synchronization
     * @private
     */
    private async fetchAndSyncSeries(): Promise<TSeries[]> {
        const localSeriesMap = await this.#localRepo.getAllSeries();
        const firestoreSeriesMap = await this.#firestoreRepo.getAllSeries();

        try {
            await this.#syncManager.synchronize(localSeriesMap, firestoreSeriesMap);
            const updatedFirestoreMap = await this.#firestoreRepo.getAllSeries();

            return this.combineAndTransformSeries(updatedFirestoreMap, localSeriesMap);
        } catch (error) {
            console.error('Error synchronizing with Firestore:', error);
            return this.combineAndTransformSeries(firestoreSeriesMap, localSeriesMap);
        }
    }

    /**
     * ### Combines and transforms series data
     * 
     * Combines series data from primary and secondary maps, giving precedence to primary map entries,
     * and transforms the combined series to TSeries objects.
     * 
     * @param {Record<string, Series>} primaryMap
     *  Record of series where keys are series names and values are ISeries objects.
     *  Entries in this map take precedence over secondaryMap entries with the same key.
     * @param {Record<string, Series>} secondarymap
     *  Record of series where keys are series names and values are ISeries objects.
     *  Entries in this map are only used if no entry exists with the same key in primaryMap.
     * @returns {TSeries[]} An array of TSeries objects representing the combined and transformed series data.
     */
    private combineAndTransformSeries(
        primaryMap: Record<string, Series>,
        secondarymap: Record<string, Series>
    ): TSeries[] {
        const combinedSeriesMap = { ...primaryMap };

        for (const [seriesName, series] of Object.entries(secondarymap)) {
            if (!combinedSeriesMap[seriesName]) {
                combinedSeriesMap[seriesName] = series;
            }
        }

        return Object.values(combinedSeriesMap).map(
            (series) => this.#transformer.toTSeries(series)
        );
    }
}


export const seriesService = new SeriesService();