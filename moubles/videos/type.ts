

import { inferRouterOutputs } from "@trpc/server";


import { AppRouter } from "@/trpc/router/_app";


export type VideoGetOneOutput = 
inferRouterOutputs<AppRouter>["videos"]["getOne"];

// TODO : change videos to getMany
export type VideoGetManyutput = 
inferRouterOutputs<AppRouter>["suggestions"]["getMany"];