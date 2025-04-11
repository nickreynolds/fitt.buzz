/* eslint-disable */
const { withAndroidManifest } = require("@expo/config-plugins");

const customActivity = {
  $: {
    "android:name": "expo.modules.appblocker.MyActivity",
  },
};

function addCustomActivityToMainApplication(androidManifest, attributes) {
  const { manifest } = androidManifest;

  // Check if there are any application tags
  if (!Array.isArray(manifest.application)) {
    console.warn(
      "withAndroidMainActivityAttributes: No application array in manifest?",
    );
    return androidManifest;
  }

  // Find the "application" called ".MainApplication"
  const application = manifest.application.find(
    (item) => item.$["android:name"] === ".MainApplication",
  );
  if (!application) {
    console.warn("addCustomActivityToMainApplication: No .MainApplication?");
    return androidManifest;
  }

  // Check if there are any activity tags
  const activities = application.activity;
  if (!Array.isArray(activities)) {
    console.warn(
      "addCustomActivityToMainApplication: No activity array in .MainApplication?",
    );
    return androidManifest;
  }

  // If we don't find the custom activity, add it
  // If we do find it, assume it's correct
  if (
    !activities.find(
      (item) => item.$["android:name"] === "expo.modules.appblocker.MyActivity",
    )
  ) {
    activities.push(customActivity);
  }

  return androidManifest;
}

module.exports = function withAndroidCustomActivity(config, attributes) {
  return withAndroidManifest(config, (config) => {
    config.modResults = addCustomActivityToMainApplication(
      config.modResults,
      attributes,
    );
    return config;
  });
};
