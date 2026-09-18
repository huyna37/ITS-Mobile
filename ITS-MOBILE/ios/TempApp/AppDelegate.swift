import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "ITSMobileVEC",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    if let docDir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
      let mainBundle = docDir.appendingPathComponent("ota/main.jsbundle")
      if FileManager.default.fileExists(atPath: mainBundle.path) {
        return mainBundle
      }
      let altBundle = docDir.appendingPathComponent("ota/index.android.bundle")
      if FileManager.default.fileExists(atPath: altBundle.path) {
        return altBundle
      }
    }
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
