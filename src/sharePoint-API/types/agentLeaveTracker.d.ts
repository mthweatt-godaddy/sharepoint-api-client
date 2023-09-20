//----------------------------------------
// Agent Leave Tracker API Response Object
//----------------------------------------
export interface AgentLeaveTrackerResponse {
  'odata.metadata': string;
  'odata.nextLink': string;
  value: AgentLeaveTrackerItem[];
}

//----------------------------------------
// Single Agent Leave Tracker item
//----------------------------------------
export interface AgentLeaveTrackerItem {
  'odata.type': string;
  'odata.id': string;
  'odata.etag': string;
  'odata.editLink': string;
  FileSystemObjectType: number;
  Id: number;
  ServerRedirectedEmbedUri: string;
  ServerRedirectedEmbedUrl: string;
  ContentTypeId: string;
  Title: string;
  Employee_x0020_ID: number;
  Employee_x0020_Name: string;
  Leave_x0020_Type: string;
  Leave_x0020_Start_x0020_Date: string;
  Leave_x0020_End_x0020_Date: string;
  Accommodation: string;
  Resolved: boolean;
  AgentLea: number;
  ComplianceAssetId: number;
  AuthorId: number;
  OData__ColorTag: string;
  ID: number;
  Modified: string;
  Created: string;
  EditorId: number;
  OData__UIVersionString: string;
  Attachments: boolean;
  GUID: string;
}
