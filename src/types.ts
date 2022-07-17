import { IncomingMessage, ServerResponse } from "http";

export enum Level {
  EMERGENCY = "EMERGENCY",
  ALERT = "ALERT",
  CRITICAL = "CRITICAL",
  ERROR = "ERROR",
  WARNING = "WARNING",
  NOTICE = "NOTICE",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

export type ClientOptions = {
  client_id: string;
  client_secret: string;
  health_checks?: {
    protocol: string;
    host: string;
    port: number;
  }[];
};

export type SearchResponse = {
  hits: Partial<Core>[];
  nbhits: number;
};

export type Core = {
  ip: string;
  host: string;
  method: string;
  url: string;
  level: Level;
  tags: string[];
  metadata: Metadata;
  response_time: number;
};

export interface Metadata extends StrictMetadata {
  [k: string]: any;
}

export interface StrictMetadata {
  headers: Record<string, any>;
  protocol: string;
  path: string;
  originalUrl: string;
  cookies: string;
  query: Record<string, any>;
  body: Record<string, any>;
}

export type RequestData = Partial<{
  body: Record<string, any>;
  ip: string;
  headers: Record<string, any>;
  host: string;
  protocol: string;
  method: string;
  originalUrl: string;
  path: string;
  url: string;
  cookies: string | Record<string, any>;
  query: Record<string, any>;
}>;

export type LogOptions = {
  data: string | Record<string, any>;
  level?: Level;
  tags?: string[];
};

export type SearchOptions = {
  query: string;
  take?: number;
  skip?: number;
  field?: string;
  from?: Date;
  until?: Date;
};

export interface NextApiRequest extends IncomingMessage {
  /**
   * Object of `query` values from url
   */
  query: Partial<{
    [key: string]: string | string[];
  }>;
  /**
   * Object of `cookies` from header
   */
  cookies: Partial<{
    [key: string]: string;
  }>;
  body: any;
  preview?: boolean;
  /**
   * Preview data set on the request, if any
   * */
  previewData?: string | false | object | undefined;
}

type Send<T> = (body: T) => void;

export type NextApiResponse<T = any> = ServerResponse & {
  locals?: Record<string, any>;
  /**
   * Send data `any` data in response
   */
  send: Send<T>;
  /**
   * Send data `json` data in response
   */
  json: Send<T>;
  status: (statusCode: number) => NextApiResponse<T>;
  redirect(url: string): NextApiResponse<T>;
  redirect(status: number, url: string): NextApiResponse<T>;
  /**
   * Set preview data for Next.js' prerender mode
   */
  setPreviewData: (
    data: object | string,
    options?: {
      /**
       * Specifies the number (in seconds) for the preview session to last for.
       * The given number will be converted to an integer by rounding down.
       * By default, no maximum age is set and the preview session finishes
       * when the client shuts down (browser is closed).
       */
      maxAge?: number;
    }
  ) => NextApiResponse<T>;
  clearPreviewData: () => NextApiResponse<T>;
  /**
   * @deprecated `unstable_revalidate` has been renamed to `revalidate`
   */
  unstable_revalidate: () => void;
  revalidate: (
    urlPath: string,
    opts?: {
      unstable_onlyGenerated?: boolean;
    }
  ) => Promise<void>;
};
