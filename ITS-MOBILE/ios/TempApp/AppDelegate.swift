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
      let otaDir = docDir.appendingPathComponent("ota")
      let mainBundle = otaDir.appendingPathComponent("main.jsbundle")
      if FileManager.default.fileExists(atPath: mainBundle.path) {
        // Kiểm tra an toàn: Đọc nội dung bundle OTA để ngăn chặn bundle Android
        if let content = try? String(contentsOf: mainBundle, encoding: .utf8) {
          if content.contains("AndroidTextInput") || !content.contains("RCTSinglelineTextInputView") {
            try? FileManager.default.removeItem(at: otaDir)
            return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
          }
          return mainBundle
        }
      }
    }
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
