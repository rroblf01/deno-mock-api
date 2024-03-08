import { ConnInfo, json, PathParams, validateRequest } from "./deps.ts";
import { checkBody, getParam } from "./utils.ts";
import {
  createAllElementsController,
  getAllElementsController,
  getElementController,
} from "./controller.ts";

export const createElementRoute = async (request: Request) => {
  if (request.method !== "POST") {
    return json(
      {
        message: "Method not allowed",
      },
      { status: 405 },
    );
  }

  const { error, body } = await validateRequest(request, {
    POST: {
      body: ["items"],
    },
  });
  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  const bodyCheck = checkBody(body);
  if (bodyCheck) return bodyCheck[0];
  return createAllElementsController(body.items);
};

export const getAllRoute = (request: Request) => {
  const uuid = getParam(request.url, "uuid");
  if (!uuid) {
    return json(
      {
        message: "Param uuid is required",
      },
      { status: 404 },
    );
  }
  return getAllElementsController(uuid);
};

export const infoRoute = () => {
  let message =
    "This is a mock server, you can use it to test your application. Create a mock by making a POST request to";
  message +=
    ' /createElement with a Body similar to this {"items": [{"method": "PUT", "response": {"id": "12345", "name": " John"}}]}  ';
  message +=
    "To make the request, launch the indicated method to the uuid that will be told when creating the element.  ";
  message +=
    "For example, for the above body, if it had returned the uuid d106450b-2bca-4d58-b3b1-9a776ad1be6d, you would have to do a PUT /mock?uuid=d106450b-2bca-4d58-b3b1-9a776ad1be6d ";
  return json(
    {
      message: message,
    },
  );
};

export const mockRoute = (request: Request) => {
  const uuid = getParam(request.url, "uuid");
  const path = getParam(request.url, "path");
  if (!uuid || !path) {
    return json(
      {
        message: "Param uuid and path are required",
      },
      { status: 404 },
    );
  }
  return getElementController(uuid, request.method, path);
};

export const getElementBySlugRoute = async (
  _request: Request,
  _connInfo: ConnInfo,
  params: PathParams,
) => {
  let fileSize;
  const filePath = "./client/" + params.slug;
  try {
    fileSize = (await Deno.stat(filePath)).size;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return new Response(null, { status: 404 });
    }
    return new Response(null, { status: 500 });
  }

  const contentType = params.slug.split(".")[1] === "js"
    ? "application/javascript"
    : "text/css";
  const body = (await Deno.open(filePath)).readable;
  return new Response(body, {
    headers: {
      "content-length": fileSize.toString(),
      "content-type": contentType,
    },
  });
};

export const homeRoute = async (_request: Request) => {
  let fileSize;
  const filePath = "./client/index.html";
  try {
    fileSize = (await Deno.stat(filePath)).size;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return new Response(null, { status: 404 });
    }
    return new Response(null, { status: 500 });
  }
  const body = (await Deno.open(filePath)).readable;
  return new Response(body, {
    headers: {
      "content-length": fileSize.toString(),
      "content-type": "text/html",
    },
  });
};
