const kv = await Deno.openKv();

export const getElement = async (uuid: string, method: string) => {
  const element = await kv.get([uuid, method]);

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
  items: { method: string; response: string }[],
) => {
  const expireDays = Number(Deno.env.get("EXPIRATION_DAYS")) || 10;
  const uuid = crypto.randomUUID();

  const allPromises = items.map((item) => {
    const { method, response } = item;
    return kv.set([uuid, method], response, {
      expireIn: expireDays * 24 * 60 * 60 * 1000,
    });
  });

  Promise.all(allPromises);

  return uuid;
};
