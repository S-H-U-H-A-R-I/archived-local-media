import { json } from "@sveltejs/kit";

import { createApiErrorResponse } from "$lib/server/utils/index.js";
import { seriesService, type TSeries } from "$lib/server/utils/media/index.js";
import type { RequestHandler } from "./$types.js";


export const GET: RequestHandler = async (): Promise<Response> => {
    try {
        const data: TSeries[] = await seriesService.getSeries(true);
        return json(data);
    } catch (error) {
        return json(
            createApiErrorResponse(
                500,
                'Failed to refresh series folders: ' +
                `${error instanceof Error ? error.message : error}`
            ),
            { status: 500 }
        );
    }
};