import { createClient } from "redis";
import { REDIS_URL } from "../../Config/Config.service.js";

export const client = createClient({
  url: REDIS_URL,
});

async function redisConnection() {
  try {
    await client.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.log("Redis connection failed ", error);
  }
}
export default redisConnection;













