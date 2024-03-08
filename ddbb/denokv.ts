const kv = await Deno.openKv();

export const getElement = async (
  uuid: string,
  method: string,
  path: string,
) => {
  const element = await kv.get([uuid, method, path]);

  return element.value;
};

export const getAllElements = async (uuid: string) => {
  const iter = await kv.list({ prefix: [uuid] });
  const responses = [];
  for await (const item of iter) {
    responses.push(item.value);
  }
  return responses;
};

export const createAllElements = (
  items: { path: string; method: string; response: string }[],
) => {
  const expireDays = Number(Deno.env.get("EXPIRATION_DAYS")) || 10;
  const uuid = crypto.randomUUID();

  const allPromises = items.map((item) => {
    const { method, response, path } = item;
    return kv.set([uuid, method, path], response, {
      expireIn: expireDays * 24 * 60 * 60 * 1000,
    });
  });

  Promise.all(allPromises);

  return uuid;
};
