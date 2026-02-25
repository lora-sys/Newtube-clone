import { Client } from "@upstash/workflow";

export const workflow = new Client({ 
  baseUrl: process.env.QSTASH_URL!,
  token: process.env.QSTASH_TOKEN! 
})
