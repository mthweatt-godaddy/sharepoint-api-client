import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import spoApiClient from './sharePoint-API';
import logger from './winston';
import { getElapsedTime } from './misc';
import { AgentLeaveTrackerResponse } from './sharePoint-API/types';

// Main
(async () => {
  try {
    logger.info(`--- Starting <cool script name> (${process.env.NODE_ENV.toUpperCase()} MODE) ---`);
    const startTime: Date = new Date();

    // Get SPO Auth Token
    await spoApiClient.getToken();

    // Get Agent Leave Tracker Items
    const trackerItems: AgentLeaveTrackerResponse = await spoApiClient.getAgentLeaveTrackerItems();

    // Quick print to see first item in value array
    console.log(trackerItems.value[0]);
    // Quick print title field of first list item
    console.log(trackerItems.value[0].Title);

    // ✅ Process Complete
    logger.info(`--- <cool script name> Complete (${getElapsedTime(startTime)}) ---`);

    // ❌ Unexpected Errors
  } catch (error) {
    logger.error(error.message);
    // Potentially do other things with errors, i.e. slack notifications etc.
  }
})();
