const fs = require("fs");
const { translate } = require("@vitalets/google-translate-api");
const enJson = require("../app/locales/languages/en.json");
const path = require("path");
const { HttpsProxyAgent } = require("https-proxy-agent");
const otherLanguages = [
  "bn",
  "es",
  "hi",
  "id",
  "my",
  "ru",
  "tr",
  "uk",
  "vi",
  "zh",
  "de",
  "ur",
];

const debug = false;

// run `yarn tranlate -p [your port]` and the default port is 7890
const args = process.argv;
const portIndex = args.indexOf("-p");
const port = portIndex !== -1 ? args[portIndex + 1] : "7890";

// 填写自己的代理地址
const agent = new HttpsProxyAgent(`http://127.0.0.1:${port}`);

const readJson = (p) => {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
};

// 深度遍历 JSON 对象并翻译值
async function translateValues(lang, obj, enObj, prefix, specialKeys) {
  for (const key in enObj) {
    if (typeof enObj[key] === "object") {
      if (!obj[key]) {
        obj[key] = {};
      }
      await translateValues(
        lang,
        obj[key],
        enObj[key],
        prefix.concat(key),
        specialKeys,
      );
    } else if (!obj[key]) {
      if (debug) {
        console.log("start querying ", enObj[key]);
      }
      const translation = await translate(enObj[key], {
        from: "en",
        to: lang,
        fetchOptions: {
          agent,
          Headers: {
            "user-agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.46",
          },
        },
      });
      obj[key] = translation.text;
      const allKey = prefix.concat(key).join(":");
      console.log(`翻译 ${allKey} 英文: ${enObj[key]}; ${lang}: ${obj[key]}`);
      if (enObj[key].includes("{{")) {
        specialKeys.push(allKey);
      }
    }
  }
}

async function main() {
  let flag = false;
  for (let language of otherLanguages) {
    const p = path.resolve(
      __dirname,
      `../app/locales/languages/${language}.json`,
    );
    const json = readJson(p);
    console.log(`===> 开始翻译 ${language}`);
    const specialKeys = [];
    try {
      await translateValues(language, json, enJson, [], specialKeys);
    } catch (err) {
      console.error(err);
      flag = true;
    }

    console.log(
      `===> 这些 key 需要手动确认下: ${JSON.stringify(specialKeys, null, 2)}`,
    );
    const str = JSON.stringify(json, null, 2) + "\n";
    fs.writeFileSync(p, str);
    if (flag) {
      console.log("===> 出错中断: ", language);
      break;
    } else {
      console.log(`===> ${language} 翻译完成`);
    }
  }
}

main();
