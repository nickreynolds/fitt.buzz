import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "fitt-buzz-mobile",
  slug: "fitt-buzz-mobile",
  scheme: "fitt-buzz-mobile",
  version: "0.1.3",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#1F104A",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "buzz.fitt.mobile",
    supportsTablet: true,
  },
  android: {
    package: "buzz.fitt.mobile",
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#1F104A",
    },
    versionCode: 2,
  },
  // extra: {
  //   eas: {
  //     projectId: "your-eas-project-id",
  //   },
  // },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: ["expo-router"],
  owner: "nickreynolds2",
  extra: {
    eas: {
      projectId: "91735343-26db-4e80-93f0-5bc15f2d8161",
    },
  },
});
