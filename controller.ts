import {
  createAllElements,
  getAllElements,
  getElement,
} from "./ddbb/denokv.ts";
import { json } from "./deps.ts";

export const getElementController = async (
  uuid: string,
  method: string,
  path: string,
) => {
  const element = await getElement(uuid, method, path);

  if (element) {
    return json(element);
  } else {
    return json(
      {
        message: "Field not found",
      },
      { status: 404 },
    );
  }
};

export const getAllElementsController = async (uuid: string) => {
  const responses = await getAllElements(uuid);

  if (responses.length > 0) {
    return json(responses);
  } else {
    return json(
      {
        message: "Field not found",
      },
      { status: 404 },
    );
  }
};

export const createAllElementsController = (
  items: { method: string; response: string; path: string }[],
) => {
  const uuid = createAllElements(items);
  return json({
    message: "Success",
    uuid: uuid,
  }, { status: 201 });
};
