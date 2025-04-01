import type { Episode, Season, Series, TEpisode, TSeason, TSeries } from "../../models/series.models.js";


export class SeriesTransformerManager {
    /**
     * ### Transforms an ISeries object into a TSeries object.
     * 
     * This method extracts the 'ref' property and 'seasons' from the input ISeries object.
     * It then creates a new TSeries object by spreading the rest of the series properties
     * and transforming the seasons using the toTSeason method.
     * 
     * @param series - The ISeries object to transform
     * @returns A TSeries object without the 'ref' property and with transformed seasons
     */
    public toTSeries(series: Series): TSeries {
        const { ref: _ref, seasons, ...seriesWithoutRef } = series;
        return {
            ...seriesWithoutRef,
            seasons: this.toTSeason(seasons)
        };
    }

    /**
     * ### Transforms a record of ISeason entries into a TSeason object.
     * 
     * @param seasons - A record where keys are season numbers and values are season objects from ISeason
     * @returns A TSeason object with each season's information, excluding the 'ref' property,
     *          and with episodes transformed via the toTEpisode method
     */
    public toTSeason(seasons: Season): TSeason {
        return Object.entries(seasons).reduce((acc, [seasonNum, season]) => {
            const { ref: _ref, episodes, ...seasonWithoutRef } = season;
            acc[+seasonNum] = {
                ...seasonWithoutRef,
                episodes: this.toTEpisode(episodes)
            };
            return acc;
        }, {} as TSeason);
    }

    /**
     * ### Transforms a Record of episode numbers to IEpisode entries into a TEpisode object.
     * 
     * This method iterates through each episode in the provided record and removes the 'ref' property,
     * creating a new TEpisode object with the episode number as the key and the episode without the ref as the value.
     * 
     * @param episodes - A Record where the key is the episode number and the value is an episode from the IEpisode array
     * @returns A TEpisode object with the ref property removed from each episode
     */
    public toTEpisode(episodes: Episode): TEpisode {
        return Object.entries(episodes).reduce((acc, [episodeNum, episode]) => {
            const { ref: _Ref, ...episodeWithoutRef } = episode;
            acc[+episodeNum] = episodeWithoutRef;
            return acc;
        }, {} as TEpisode);
    }
}