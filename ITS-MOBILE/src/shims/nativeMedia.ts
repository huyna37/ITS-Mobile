export const launchCamera = async () => ({ didCancel: true, assets: [] });
export const launchImageLibrary = async () => ({ didCancel: true, assets: [] });

export const Image = {
  compress: async (uri: string) => uri,
};

export const Video = {
  compress: async (uri: string) => uri,
};

export const Audio = {
  compress: async (uri: string) => uri,
};

export default {
  launchCamera,
  launchImageLibrary,
  Image,
  Video,
  Audio,
};
