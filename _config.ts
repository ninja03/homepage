import lume from "lume/mod.ts";

const site = lume();
site.copy("denokun/img");
site.copy("denokun/lib");
site.copy("denokun/style.css");
site.copy("game");
site.copy("ijvr");
site.copy("kkms");

export default site;
