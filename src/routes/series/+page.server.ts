import { seriesService, type TSeries } from "$lib/server/utils/media/index.js";
import type { PageServerLoad } from "../$types.js";


export const load: PageServerLoad = async (): Promise<{ series: TSeries[] }> => {
    return {
        series: await seriesService.getSeries(false),
    };
};