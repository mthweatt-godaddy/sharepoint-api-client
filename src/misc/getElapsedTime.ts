/**********************************************************************
 * Get elapsed time between given start time and now
 * @param {Date} startTime - start time date object
 * @return {string} hh:mm:ss
 **********************************************************************/
export function getElapsedTime(startTime: Date): string {
  // Get elapsed seconds
  const endTime: Date = new Date();
  const timeDiff: number = Number(endTime) - Number(startTime); //in ms
  const hhmmss: string = new Date(timeDiff).toISOString().slice(11, 19);
  //const mmss: string = new Date(timeDiff).toISOString().slice(14, 19);
  return hhmmss;
}
