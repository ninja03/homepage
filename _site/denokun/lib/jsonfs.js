const jsonfs = {
  read(fn) {
    try {
      return JSON.parse(Deno.readTextFileSync(fn));
    } catch (e) {
    }
    return null;
  },
  write(fn, json) {
    Deno.writeTextFileSync(fn, JSON.stringify(json));
  }
};

export { jsonfs };
