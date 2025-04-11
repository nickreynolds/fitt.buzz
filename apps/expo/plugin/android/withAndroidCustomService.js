/* eslint-disable */
const { withAndroidManifest } = require("@expo/config-plugins");

const customService = {
  $: {
    "android:name": "expo.modules.appblocker.services.BaseBlockingService",
    "android:permission": "android.permission.BIND_ACCESSIBILITY_SERVICE",
    "android:exported": "true",
  },
};

const customIntent = {
  $: {
    "android:name": "android.accessibilityservice.AccessibilityService",
  },
};

customService["intent-filter"] = {};
customService["intent-filter"].action = [customIntent];

const customMetadata = {
  $: {
    "android:name": "android.accessibilityservice",
    "android:resource": "@xml/app_blocker_service_config",
  },
};

customService["meta-data"] = [customMetadata];

function addCustomServiceToMainApplication(androidManifest, attributes) {
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
  if (!Array.isArray(application.service)) {
    application.service = [];
  }

  const services = application.service;
  if (!Array.isArray(services)) {
    console.warn(
      "addCustomServiceToMainApplication: No service array in .MainApplication?",
    );
    return androidManifest;
  }

  // If we don't find the custom activity, add it
  // If we do find it, assume it's correct
  if (
    !services.find(
      (item) =>
        item.$["android:name"] ===
        "expo.modules.appblocker.services.BaseBlockingService",
    )
  ) {
    services.push(customService);
  }

  return androidManifest;
}

module.exports = function withAndroidCustomService(config, attributes) {
  return withAndroidManifest(config, (config) => {
    config.modResults = addCustomServiceToMainApplication(
      config.modResults,
      attributes,
    );
    return config;
  });
};
