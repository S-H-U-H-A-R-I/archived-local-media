import { json } from "@sveltejs/kit";

import { createApiErrorResponse } from "$lib/server/utils/index.js";
import { seriesService } from "$lib/server/utils/media/index.js";

import type { RequestEvent, RequestHandler } from './$types.js';


export const GET: RequestHandler = async (): Promise<Response> => {
    try {
        const candidates = await seriesService.getConversionCandidates();
        return json(candidates);
    } catch (error) {
        return json(
            createApiErrorResponse(
                500,
                'Failed to check for conversion candidates: ' +
                `${error instanceof Error ? error.message : error}`
            ),
            { status: 500 }
        );
    }
};


export const POST: RequestHandler = async ({ request }: RequestEvent): Promise<Response> => {
    try {
        const data = await request.json();
        const filePaths = data.filePaths as string[] | undefined;
        const result = await seriesService.convertEpisode(filePaths);
        return json(result);
    } catch (error) {
        return json(
            createApiErrorResponse(
                500,
                'Failed to convert files: ' +
                `${error instanceof Error ? error.message : error}`
            ),
            { status: 500 }
        );
    }
};