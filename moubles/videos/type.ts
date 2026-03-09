

import { inferRouterOutputs } from "@trpc/server";


import { AppRouter } from "@/trpc/router/_app";


export type VideoGetOneOutput = 
inferRouterOutputs<AppRouter>["videos"]["getOne"];

export type VideoGetManyOutput = 
inferRouterOutputs<AppRouter>["videos"]["getMany"];