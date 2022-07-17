import axios, { AxiosInstance } from "axios";
import omit from "lodash.omit";
import pick from "lodash.pick";
import { ClientOptions, LogOptions, NextApiRequest, NextApiResponse } from "./types";
import { extractErrorObject, extractRequestData, setResponseData } from "./utils";
import { Level } from "src/types";

export class Client {
  private axiosInstance: AxiosInstance;
  private options: ClientOptions;

  constructor(options: ClientOptions) {
    this.options = options;
    this.axiosInstance = axios.create({
      baseURL: process.env.TEST_API_URL || "https://api.grapherjs.com",
    });
  }

  async client(): Promise<{ access_token: string; type: string } | null> {
    return new Promise((resolve, reject) => {
      this.axiosInstance
        .post(
          "/token",
          {},
          {
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${this.options.client_id}:${this.options.client_secret}`
              ).toString("base64")}`,
            },
          }
        )
        .then(({ data }) => {
          resolve(data);
        })
        .catch(reject);
    });
  }

  async log(
    req: NextApiRequest,
    res: NextApiResponse,
    { data, level = Level.DEBUG, tags }: LogOptions,
    cb?: (data?: any, error?: Error) => any
  ) {
    setResponseData(res);

    const requestData = extractRequestData(req);

    res.once("finish", () => {
      setImmediate(async () => {
        const core = ["ip", "host", "method", "url"];

        const log: Record<string, any> = {
          ...pick(requestData, core),
          level,
          tags,
          metadata: omit(requestData, core),
        };

        log.metadata.data = data;

        if (res.locals?.error) {
          log.metadata.error = res.locals.error;
          log.level = Level.ERROR;
        }

        if (res.locals?.data) {
          log.status_code = res.statusCode;
          log.metadata.response = {
            data: res.locals.data,
          };
        }

        try {
          const auth = await this.client();

          if (!auth) {
            cb?.(undefined, new Error("Invalid token"));
          }

          const { access_token, type } = auth!;

          const { data } = await this.axiosInstance.post("/v1/logs", log, {
            headers: {
              Authorization: `${type} ${access_token}`,
            },
          });

          cb?.(data);
        } catch (err: any) {
          cb?.(undefined, err);
        }
      });
    });
  }

  withTracingHandler(
    apiHandler: (req: NextApiRequest, res: NextApiResponse) => Promise<any> | any
  ) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const core = ["ip", "host", "method", "url"];
      const requestData = extractRequestData(req);
      const log: Record<string, any> = {
        ...pick(requestData, core),
        level: Level.DEBUG,
        metadata: omit(requestData, core),
      };

      setResponseData(res);

      let error: Error | null = null;

      try {
        const startTime = process.hrtime();
        await apiHandler(req, res);
        const diff = process.hrtime(startTime);
        // in ms
        log.response_time = (diff[0] * 1e3 + diff[1]) * 1e-6;
      } catch (err: any) {
        error = err;
        log.metadata.error = extractErrorObject(err);
      }

      log.status_code = res.statusCode;

      if (res.locals?.data) {
        log.metadata.response = {
          data: res.locals.data,
        };
      }

      try {
        const auth = await this.client();

        if (!auth) {
          throw new Error("Invalid token");
        }

        const { access_token, type } = auth;

        await this.axiosInstance.post("/v1/logs", log, {
          headers: {
            Authorization: `${type} ${access_token}`,
          },
        });
      } catch (err: any) {
        console.log(err?.response?.data.errors);
      }

      if (error) {
        throw error;
      }
    };
  }
}
