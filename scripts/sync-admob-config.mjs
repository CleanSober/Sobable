import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env");
const iosPlistPath = path.join(rootDir, "ios/App/App/Info.plist");
const androidStringsPath = path.join(rootDir, "android/app/src/main/res/values/strings.xml");

const readFile = (filePath) => fs.readFileSync(filePath, "utf8");

const parseEnv = (content) => {
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
};

const updateTagValue = (content, key, value) => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(<key>${escapedKey}<\\/key>\\s*<string>)([\\s\\S]*?)(<\\/string>)`,
    "m",
  );

  if (pattern.test(content)) {
    return content.replace(pattern, `$1${value}$3`);
  }

  const dictClose = content.indexOf("</dict>");
  if (dictClose === -1) {
    throw new Error("Info.plist does not contain a closing </dict> tag.");
  }

  const insertion = `\t<key>${key}</key>\n\t<string>${value}</string>\n`;
  return `${content.slice(0, dictClose)}${insertion}${content.slice(dictClose)}`;
};

const updateAndroidString = (content, key, value) => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(<string name="${escapedKey}">)([\\s\\S]*?)(<\\/string>)`, "m");

  if (pattern.test(content)) {
    return content.replace(pattern, `$1${value}$3`);
  }

  const resourcesClose = content.indexOf("</resources>");
  if (resourcesClose === -1) {
    throw new Error("strings.xml does not contain a closing </resources> tag.");
  }

  const insertion = `    <string name="${key}">${value}</string>\n`;
  return `${content.slice(0, resourcesClose)}${insertion}${content.slice(resourcesClose)}`;
};

if (!fs.existsSync(envPath)) {
  throw new Error(".env file not found.");
}

const env = parseEnv(readFile(envPath));
const iosAppId = env.VITE_ADMOB_IOS_APP_ID?.trim();
const androidAppId = env.VITE_ADMOB_ANDROID_APP_ID?.trim();
const trackingMessage =
  env.VITE_ADMOB_IOS_TRACKING_DESCRIPTION?.trim() ||
  "This identifier is used to deliver ads and measure their performance.";

if (iosAppId) {
  const updatedPlist = updateTagValue(
    updateTagValue(readFile(iosPlistPath), "GADApplicationIdentifier", iosAppId),
    "NSUserTrackingUsageDescription",
    trackingMessage,
  );
  fs.writeFileSync(iosPlistPath, updatedPlist);
  console.log(`Updated iOS AdMob app ID in ${path.relative(rootDir, iosPlistPath)}`);
} else {
  console.log("Skipped iOS plist update: VITE_ADMOB_IOS_APP_ID is empty.");
}

if (androidAppId) {
  const updatedStrings = updateAndroidString(readFile(androidStringsPath), "admob_app_id", androidAppId);
  fs.writeFileSync(androidStringsPath, updatedStrings);
  console.log(`Updated Android AdMob app ID in ${path.relative(rootDir, androidStringsPath)}`);
} else {
  console.log("Skipped Android strings update: VITE_ADMOB_ANDROID_APP_ID is empty.");
}
