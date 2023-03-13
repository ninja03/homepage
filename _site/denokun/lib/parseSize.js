const parseSize = (s) => {
  s = s.toUpperCase();
  const n = parseFloat(s);
  const n2 = (() => {
    if (s.endsWith("TB")) {
      return n * 1024 * 1024 * 1024 * 1024;
    } else if (s.endsWith("GB")) {
      return n * 1024 * 1024 * 1024;
    } else if (s.endsWith("MB")) {
      return n * 1024 * 1024;
    } else if (s.endsWith("KB")) {
      return n * 1024;
    } else {
      return n;
    }
  })();
  return Math.floor(n2);
};

/*
console.log(parseSize(".5MB"));
console.log(parseSize("1TB"));
console.log(parseSize("100"));
console.log(parseSize("3KB"));
*/

export { parseSize };
