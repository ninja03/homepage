const getExtension = (fn, def) => {
  const n = fn.lastIndexOf(".");
  const m = fn.lastIndexOf("/");
  const l = fn.lastIndexOf("\\");
  if (n < 0 || n < m || n < l) {
    return def;
  }
  return fn.substring(n);
};

export { getExtension };
