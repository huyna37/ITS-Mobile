import { AppRegistry } from 'react-native';
import App from '../App';

AppRegistry.registerComponent('App', () => App);
const rootTag = document.getElementById('root');
if (rootTag) {
  AppRegistry.runApplication('App', {
    initialProps: {},
    rootTag: rootTag as unknown as Parameters<typeof AppRegistry.runApplication>[1]['rootTag'],
  });
}

