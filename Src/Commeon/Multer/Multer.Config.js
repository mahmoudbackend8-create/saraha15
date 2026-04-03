import multer from "multer";
import { randomUUID } from "crypto";
import fs from "node:fs";
import path from "path";
export const allowFileFormats = {
  img: ["image/jpeg", "image/png"],
  video: ["Video/mp4"],
};
export function localUpload({
  folderName = "generalFolder",
  allowedFormates = allowFileFormats.img,
  fileSize = 10,
}) {
  const StorageEnginee = multer.diskStorage({
    destination: function (req, file, callBack) {
      const fullPath = path.resolve(`./uploads/${folderName}`);

      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      callBack(null, fullPath);
    },
    filename: function (req, file, callBack) {
      const fileName = randomUUID() + " _ " + file.originalname;
      const finalPath = `uploads/${folderName}/${fileName}`;
      file.finalPath = finalPath;

      callBack(null, fileName);
    },
  });

  function fileFilter(req, file, cb) {
    if (!allowedFormates.includes(file.mimetype)) {
      return cb(
        new Error("invalid file", { cause: { statusCode: 404 } }),
        false,
      );
    }
    return cb(null, true);
  }

  return multer({
    storage: StorageEnginee,
    fileFilter,
    limits: { fileSize: fileSize * 1024 * 1024 }, //1 ميجا
  });

  // const upload = multer({ dest: "tmp/" });
}

/*
1-create fileFillter function
2-
*/
// any other middelWare using req.body  must be after multer meddelWare
