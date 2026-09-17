if (typeof global.ErrorUtils === 'undefined') {
  global.ErrorUtils = {
    setGlobalHandler: () => {},
    getGlobalHandler: () => () => {},
    reportError: (err) => console.error(err),
    reportFatalError: (err) => console.error(err),
    applyWithGuard: (fn, ctx, args) => fn?.apply(ctx, args),
    applyWithGuardIfNeeded: (fn, ctx, args) => fn?.apply(ctx, args),
    guard: (fn) => fn,
    inGuard: () => false,
  };
}

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
