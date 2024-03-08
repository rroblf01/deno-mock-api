import { json } from "./deps.ts";

export const getParam = (url: string, param: string) => {
  const { searchParams } = new URL(url);
  return searchParams.get(param);
};

export const checkBody = (body: any) => {
  const correctsMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
  if (!body) {
    return json(
      {
        message: "Body is requireda",
      },
      { status: 400 },
    );
  }

  try {
    const items: { method: string; response: string; path: string }[] =
      body.items;

    const errors = items.map((item) => {
      const { method, response, path } = item;
      if (!path.startsWith("/")) {
        return json(
          {
            message: "Path must start with /",
          },
          { status: 400 },
        );
      }

      if (!correctsMethods.includes(method)) {
        return json(
          {
            message: "Method not allowed",
          },
          { status: 405 },
        );
      }

      if (typeof response !== "object") {
        return json(
          {
            message: "Response must be a JSON",
          },
          { status: 400 },
        );
      } else {
        if (JSON.stringify(response).length > 200) {
          return json(
            {
              message: "Response is too long",
            },
            { status: 400 },
          );
        }
      }
    });

    return errors[0];
  } catch (e) {
    return json(
      {
        message: e.message || "Body is required",
      },
      { status: 400 },
    );
  }
};
