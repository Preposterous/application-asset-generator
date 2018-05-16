const Fs = require("fs");
const Fetch = require("node-fetch");
const Bluebird = require("bluebird");

const { processSplash } = require("../../client/imageProcessor");

const TEMP_LOGO_FILENAME = "tmp_logo.png";
const TEMP_BACKGROUND_FILENAME = "tmp_background.png";

module.exports = async (request, h) => {
  const { logoUrl, backgroundUrl, color } = request.query;

  await Fetch(logoUrl).then(async res => {
    const dest = Fs.createWriteStream(TEMP_LOGO_FILENAME, {
      autoClose: true
    });

    await new Promise(resolve => {
      res.body.pipe(dest).on("close", () => {
        resolve();
      });
    });
  });

  if (backgroundUrl) {
    await Fetch(backgroundUrl).then(async res => {
      const dest = Fs.createWriteStream(TEMP_BACKGROUND_FILENAME, {
        autoClose: true
      });

      await new Promise(resolve => {
        res.body.pipe(dest).on("close", () => {
          resolve();
        });
      });
    });
  }

  await processSplash({
    logo: TEMP_LOGO_FILENAME,
    backgroundImage: backgroundUrl && TEMP_BACKGROUND_FILENAME,
    color,
    outputFile: "./tmp.png"
  });

  Fs.unlinkSync(TEMP_LOGO_FILENAME);

  if (backgroundUrl) {
    Fs.unlinkSync(TEMP_BACKGROUND_FILENAME);
  }

  return h.file("./tmp.png");
};
