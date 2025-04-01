import { notarize } from "@electron/notarize";
import dotenv from "dotenv";

dotenv.config();

// const password = "@keychain:EE_PASSWORD";

export default async function notarizing(context) {
  // const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }
  console.log("appleID: ", process.env.APPLE_ID);
  console.log("teamID: ", process.env.TEAM_ID);
  // const appName = context.packager.appInfo.productFilename;

  // console.log("password: ", password);

  return await notarize({
    appBundleId: "buzz.fitt.mobile",
    appPath: `/Users/nick/fitt.buzz/apps/nextjs/dist/mac-arm64/Fitt.Buzz.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.TEAM_ID,
  });
}
