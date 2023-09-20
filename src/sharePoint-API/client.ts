import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import logger from '../winston';
import { AgentLeaveTrackerResponse } from './types';

/***********************************************************************************************
 * SharePoint API Client
 ***********************************************************************************************/
export class SpoApiClient {
  private static instance: SpoApiClient | null = null;
  private access_token: string;
  private retryLoops: number = 5; // Number of retries where applicable
  private retryBackoffStart: number = 0.5; // Delay between retries - doubles each loop

  /***********************************************************************************************
   * Constructor
   * @params none
   * @returns none
   ***********************************************************************************************/
  constructor() {
    // Ensure needed env vars exist
    const env_vars: string[] = [
      'NODE_ENV',
      'SPO_CLIENT_ID',
      'SPO_CLIENT_ASSERTION',
      'SPO_SCOPE',
      'SPO_CLIENT_ASSERTION_TYPE',
      'SPO_GRANT_TYPE'
    ];
    // Holds missing vars
    let missing_vars: string[] = [];
    // Look for missing vars
    for (const v of env_vars) {
      if (!process.env[v]) {
        missing_vars.push(v);
      }
    }
    // Throw error if any are missing
    if (missing_vars.length > 0) {
      const errMsg: string = `The following key${
        missing_vars.length > 1 ? 's are ' : ' is'
      } not found in Environment Variables: ${missing_vars.join(', ')}`;
      throw new Error(errMsg);
    }
  }

  /***********************************************************************************************
   * Get instance if exists, create new instance if doesn't exist
   * @params none
   * @returns none
   ***********************************************************************************************/
  public static getInstance(): SpoApiClient {
    if (SpoApiClient.instance === null) {
      SpoApiClient.instance = new SpoApiClient();
    }
    return SpoApiClient.instance;
  }

  /***********************************************************************************************
   * Pause for given amount of time
   * @param {number} p seconds to pause
   * @returns none
   ***********************************************************************************************/
  private async pause(p: number): Promise<void> {
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        resolve();
      }, 1000 * p)
    );
  }

  /***********************************************************************************************
   * Get new access token from SPO auth
   * @params none
   * @returns none
   ***********************************************************************************************/
  async getToken(): Promise<void> {
    let lastError: Error;
    let backoff: number = this.retryBackoffStart;

    logger.info('Requesting SPO Authentication Token');

    // Request headers
    const reqHeaders: object = {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data'
    };

    // Request body
    const reqBody = new FormData();
    reqBody.append('client_id', process.env.SPO_CLIENT_ID);
    reqBody.append('client_assertion', process.env.SPO_CLIENT_ASSERTION);
    reqBody.append('scope', process.env.SPO_SCOPE);
    reqBody.append('client_assertion_type', process.env.SPO_CLIENT_ASSERTION_TYPE);
    reqBody.append('grant_type', process.env.SPO_GRANT_TYPE);

    // Loop through number of retries
    for (let i = this.retryLoops; i > 0; i--) {
      try {
        // Send request for token
        const res: AxiosResponse = await axios.post(process.env.SPO_TOKEN_URL, reqBody, { headers: reqHeaders });

        // Return token if exists
        if (res.data.access_token) {
          logger.info('SPO Token received');
          // Save token
          this.access_token = res.data.access_token;
          // Exit function
          return;
        }

        // Unexpected errors - pause and retry
      } catch (error) {
        lastError = error;
        logger.warn('Error during SPO Authentication:');
        logger.warn(error);
        await this.pause(backoff);
        // Double backoff time for next loop
        backoff *= 2;
      }
    }

    // If no successful token retreival, throw error
    throw lastError;
  }

  /***********************************************************************************************
   * Get items from the Agent Leave Tracker
   ***********************************************************************************************/
  async getAgentLeaveTrackerItems(): Promise<AgentLeaveTrackerResponse> {
    let lastError: Error;
    let backoff: number = this.retryBackoffStart;
    const apiUrl: string = `https://secureservernet.sharepoint.com/teams/c3workforce/WFPortal/_api/lists/getbytitle('Agent Leave Tracker')/items`;

    // Request headers (Include token)
    const reqHeaders: object = {
      Accept: 'application/json',
      Authorization: 'Bearer ' + this.access_token
    };

    // Loop through number of retries
    for (let i = this.retryLoops; i > 0; i--) {
      try {
        // Make API call
        const res: AxiosResponse = await axios.get(apiUrl, { headers: reqHeaders });
        // Return response data
        return res.data;

        // Unexpected errors - pause and retry
      } catch (error) {
        lastError = error;
        logger.warn('Error during agent leave tracker api call:');
        logger.warn(error);
        await this.pause(backoff);
        // Double backoff time for next loop
        backoff *= 2;
      }
    }
    // If no successful token retreival, throw error
    throw lastError;
  }
}

// Create instance
const spoApiClient: SpoApiClient = SpoApiClient.getInstance();

// Export client
export { spoApiClient };
