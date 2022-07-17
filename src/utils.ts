import cookie from "cookie";
import { getClientIp } from "request-ip";
import { NextApiRequest, NextApiResponse, RequestData } from "./types";

export const extractRequestData = (req: NextApiRequest, keys: string[] = []) => {
  const requestData: RequestData = {};

  const headers = req.headers || {};

  requestData.headers = headers;
  requestData.body = req.body;
  requestData.ip = getClientIp(req) || "";
  requestData.method = req.method;
  requestData.url = req.url;
  requestData.cookies = req.cookies || cookie.parse(headers.cookie || "");

  keys.forEach(async (key) => {
    if ({}.hasOwnProperty.call(req, key)) {
      requestData[key] = (req as { [key: string]: any })[key];
    }
  });

  return requestData;
};

export const extractErrorObject = (error: Error) => {
  try {
    return Object.getOwnPropertyNames(error).reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: error[cur],
      }),
      {}
    );
  } catch {}
};

export const setResponseData = async (res: NextApiResponse) => {
  const oldSend = res.send;

  res.send = function (data: any) {
    res.send = oldSend;

    if (!res.locals) {
      res.locals = {};
    }

    res.locals.data = data;

    return res.send(data);
  };
};
