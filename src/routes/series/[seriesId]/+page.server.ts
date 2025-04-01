import type { PageServerLoad } from './$types.js';

import { seriesService, type IConversionCandidate, type TSeries } from '$lib/server/utils/media/index.js';


export const load: PageServerLoad = async ({ params }): Promise<{
    series: TSeries | undefined;
    seriesId: string;
    episodesToConvert: IConversionCandidate[];
}> => {
    const seriesId = params.seriesId;
    const series = await seriesService.getSeriesById(seriesId, false);
    const episodesToConvert = await seriesService.getConversionCandidates();
    return {
        series: series,
        seriesId: seriesId,
        episodesToConvert: episodesToConvert.filter((episode) => episode.seriesName === series?.name)
    };
};