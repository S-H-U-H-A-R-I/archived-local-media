import { seriesService, type TSeries } from '$lib/server/utils/media/index.js';


export async function load(): Promise<{ series: TSeries[] }> {
    return {
        series: await seriesService.getSeries(false),
    };
}