import { DB_URL_LOCAL } from "../../Config/Config.service.js";
import { mongoose } from "mongoose";
export async function testConnection() {
  try {
    await mongoose.connect(DB_URL_LOCAL);
    console.log(`DATABASE CONNECTED SUCCESSFULLY`);
  } catch (error) {
    console.log(`FAILED TO CONNECT DATABASE`, error);
  }
}
