import type { DocumentReference, Timestamp } from "firebase-admin/firestore";

export type Episode = {
    [key: number]: {
        id?: string,
        ref?: DocumentReference<IEpisodeDocument>;
        name: string;
    }
}

export type Season = {
    [key: number]: {
        id?: string,
        ref?: DocumentReference<ISeasonDocument>;
        localPath?: string;
        name: string;
        episodes: Episode;
    }
}

export type Series = {
    id?: string
    ref?: DocumentReference<ISeriesDocument>;
    name: string;
    seasons: Season;
}

export type SeriesMap = {
    [key: string]: Series
}

export enum SeriesCollectionType {
    SERIES = 'series',
    SEASONS = 'seasons',
    EPISODES = 'episodes'
}

//#region FIRESTORE DOCUMENTS
export interface ISeriesDocument {
    name?: string | null;
    createdAt?: Timestamp | null;
}

export interface ISeasonDocument {
    season?: number | null;
    name?: string | null;
    createdAt?: Timestamp | null;
}

export interface IEpisodeDocument {
    episode?: number | null;
    name?: string | null;
    createdAt?: Timestamp | null;
}
//#endregion

//#region CLIENT CONVERTED MODELS
export type TEpisode = Omit<Episode, 'ref'>;
export type TSeason = {
    [key: number]: Omit<Season[number], 'ref'> & {
        episodes: TEpisode;
    }
};
export type TSeries = Omit<Series, 'ref'> & {
    seasons: TSeason;
};
//#endregion

export interface IConversionCandidate {
    seriesName: string;
    seasonNumber: number;
    episodeNumber: number;
    filePath: string;
    originalFormat: string;
    trargetFormat: string;
}

export type ConversionCandidatesMap = {
    [seriesId: string]: {
        [seasonNumber: string]: {
            [episodeNumber: string]: IConversionCandidate;
        }
    }
}

export interface IConvertEpisodesResponse {
    success: boolean;
    converted: number;
    failed: number;
    messages: string[];
}