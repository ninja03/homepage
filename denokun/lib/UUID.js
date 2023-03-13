// https://ja.wikipedia.org/wiki/UUID
// UUID version 4

import { rnd } from "./rnd.js";

const UUID = {};

UUID.generate = () => {
  const chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
  const len = chars.length;
  for (let i = 0; i < len; i++) {
    const c = chars[i];
    if (c === "x") {
      chars[i] = rnd(16).toString(16);
    } else if (c === "y") {
      chars[i] = (rnd(4) + 8).toString(16);
    }
  }
  return chars.join("");
};

UUID.getVersion = () => {
  return p;
};

UUID.isValid = (uuid) => {
  const UUID_MATCHER =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  return UUID_MATCHER.test(uuid);
};

// const n = UUID.generate();
// console.log(n, UUID.isValid(n));

export { UUID };
