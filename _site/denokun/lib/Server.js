import { CONTENT_TYPE } from "./CONTENT_TYPE.js";
import { UUID } from "./UUID.js";
import { getExtension } from "./getExtension.js";
import { parseURL } from "./parseURL.js";

const getFileNameFromDate = () => {
  const d = new Date();
  const fix0 = (n) => n < 10 ? "0" + n : n;
  const ymd = d.getFullYear() + fix0(d.getMonth() + 1) + fix0(d.getDate());
  return ymd + "/" + UUID.generate();
};

class Server {
  async handleApi(req) {
    //const url = req.url;
    const path = req.path;
    if (req.method === "OPTIONS") {
      const res = "ok";
      return new Response(JSON.stringify(res), {
        status: 200,
        headers: new Headers({
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Accept",
          // "Access-Control-Allow-Methods": "PUT, DELETE, PATCH",
        })
      });
    }
    try {
      const json = await (async () => {
        if (req.method === "POST") {
          return await req.json();
        } else if (req.method === "GET") {
          const n = req.url.indexOf("?");
          const sjson = decodeURIComponent(req.url.substring(n + 1));
          try {
            return JSON.parse(sjson);
          } catch (e) {
            return sjson;
          }
        }
        return null;
      })();
      // console.log("[req api]", json);
      const res = await this.api(path, json, req.remoteAddr);
      // console.log("[res api]", res);
      return new Response(JSON.stringify(res), {
        status: 200,
        headers: new Headers({
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Accept", // must
          //"Access-Control-Allow-Methods": "PUT, DELETE, PATCH",
        })
      });
    } catch (e) {
      console.log("err", e.stack);
    }
    return null;
  };
  async handleData(req) {
    //const url = req.url;
    const path = req.path;
    try {
      if (req.method === "POST") {
        const ext = getExtension(path, ".jpg");
        const bin = new Uint8Array(await req.arrayBuffer());
        // console.log("[req data]", bin.length);
        const fn = getFileNameFromDate();
        const name = fn + ext;
        try {
          Deno.mkdirSync("data");
        } catch (e) {
        }
        try {
          const dir = name.substring(0, name.lastIndexOf("/"));
          Deno.mkdirSync("data/" + dir);
        } catch (e) {
        }
        Deno.writeFileSync("data/" + name, bin);
        const res = { name };
        // console.log("[data res]", res);
        return new Response(JSON.stringify(res), {
          status: 200,
          headers: new Headers({
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type, Accept", // must
            //"Access-Control-Allow-Methods": "PUT, DELETE, PATCH",
          })
        });
      } else if (req.method === "GET" || req.method === "HEAD") {
        const fn = path;
        if (fn.indexOf("..") >= 0) {
          throw new Error("illegal filename");
        }
        const n = fn.lastIndexOf(".");
        const ext = n < 0 ? "html" : fn.substring(n + 1);
        const data = Deno.readFileSync("." + fn);
        const ctype = CONTENT_TYPE[ext] || "text/plain";
        return new Response(req.method === "HEAD" ? null : data, {
          status: 200,
          headers: new Headers({
            "Content-Type": ctype,
            "Access-Control-Allow-Origin": "*",
            "Content-Length": data.length,
          }),
        });
      }
    } catch (e) {
      console.log("err", e.stack);
    }
  }
  async handleWeb(req) {
    //const url = req.url;
    const path = req.path;
    try {
      const getRange = (req) => {
        const range = req.headers.get("Range");
        if (!range || !range.startsWith("bytes=")) {
          return null;
        }
        const res = range.substring(6).split("-");
        if (res.length === 0) {
          return null;
        }
        return res;
      };
      const range = getRange(req);
      const fn = path === "/" || path.indexOf("..") >= 0 ? "/index.html" : path;
      const n = fn.lastIndexOf(".");
      const ext = n < 0 ? "html" : fn.substring(n + 1);
      const readFileSync = (fn, range) => {
        // console.log(fn);
        const data = Deno.readFileSync(fn);
        if (!range) {
          return [data, data.length];
        }
        const offset = parseInt(range[0]);
        const len = range[1] ? parseInt(range[1]) - offset + 1 : data.length - offset;
        const res = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          res[i] = data[offset + i];
        }
        return [res, data.length];
      };
      const [data, totallen] = readFileSync("static" + fn, range);
      const ctype = CONTENT_TYPE[ext] || "text/plain";
      const headers = {
        "Content-Type": ctype,
        "Accept-Ranges": "bytes",
        "Content-Length": data.length,
      };
      if (range) {
        headers["Content-Range"] = "bytes " + range[0] + "-" + range[1] +
          "/" + totallen;
      }
      return new Response(data, {
        status: range ? 206 : 200,
        headers: new Headers(headers),
      });
    } catch (e) {
      if (path !== "/favicon.ico") {
        console.log("err", path, e.stack);
      }
    }
  }
  async start(port) {
    console.log(`http://localhost:${port}/`);
    for await (const conn of Deno.listen({ port })) {
      (async () => {
        //console.log(conn.localAddr);
        const remoteAddr = conn.remoteAddr.hostname;
        for await (const res of Deno.serveHttp(conn)) {
          const req = res.request;
          const url = req.url;
          const purl = parseURL(url);
          if (!purl) {
            continue;
          }
          req.path = purl.path;
          req.query = purl.query;
          req.host = purl.host;
          req.port = purl.port;
          req.remoteAddr = remoteAddr;
          let resd = null;
          const path = req.path;
          if (path.startsWith("/api/")) {
            resd = await this.handleApi(req);
          } else if (path.startsWith("/data/")) {
            resd = await this.handleData(req);
          } else {
            resd = await this.handleWeb(req);
          }
          if (resd) {
            res.respondWith(resd);
          } else {
            res.respondWith(await this.handleNotFound(req));
          }
        }
      })();
    }
  }
  // not found
  async handleNotFound(req) { // to override
    const err = new TextEncoder().encode("not found");
    return new Response(err);
  }

  // Web API
  async api(path, req, remoteAddr) { // to override
    return req;
  }
}

export { Server };
