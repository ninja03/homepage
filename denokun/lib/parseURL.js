const parseURL = (url) => {
  const n = url.indexOf("://");
  if (n < 0) {
    return null;
  }
  const protocol = url.substring(0, n + 3);
  const n2 = url.indexOf(":", n + 3);
  const n3 = url.indexOf("/", n + 3);
  if (n3 < 0) {
    const port = n2 < 0 ? 80 : parseInt(url.substring(n2 + 1));
    const host = n2 < 0 ? url.substring(n + 3) : url.substring(n + 3, n2);
    const path = "/";
    const query = null;
    return { protocol, port, host, path, query };
  }
  const port = n2 < 0 ? 80 : parseInt(url.substring(n2 + 1, n3));
  const host = n2 < 0 ? url.substring(n + 3, n3) : url.substring(n + 3, n2);
  const n4 = url.indexOf("?", n3);
  const path = n4 < 0 ? url.substring(n3) : url.substring(n3, n4);
  const query = n4 < 0 ? null : url.substring(n4 + 1);

  if (protocol == "file://") {
    const regexp = /(?<scheme>.+):\/\/(?<basename>.+)\/(?<filename>.+)/;
    const dirname = url.match(regexp).groups.basename + "/";
    return { protocol, port, host, path, query, dirname };
  }
  return { protocol, port, host, path: decodeURI(path), query };
};

//console.log(parseURL("https://fukuno.jig.jp/3000.html?q=test"));
//console.log(parseURL("http://fukuno.jig.jp/3000"));
//console.log(parseURL("http://fukuno.jig.jp:8881/3000"));
//console.log(parseURL("http://fukuno.jig.jp/1_%E3%83%A2%E3%83%87%E3%83%AB%E5%A5%91%E7%B4%84%E6%9B%B8v1_0_%E7%A7%98%E5%AF%86%E4%BF%9D%E6%8C%81%E5%A5%91%E7%B4%84%E6%9B%B8%EF%BC%88%E6%96%B0%E7%B4%A0%E6%9D%90%E7%B7%A8%EF%BC%89_%E9%80%90%E6%9D%A1%E8%A7%A3%E8%AA%AC%E3%81%82%E3%82%8A.md"));

export { parseURL };
