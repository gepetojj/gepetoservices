import { Router } from "express";
const router = Router();
import moment from "moment-timezone";
import shortid from "shortid";
import fs from "fs";
import firebase from "../../assets/firebase";
import response from "../../assets/response";
import textPack from "../../assets/textPack.json";
import Performance from "../../assets/tests/performance";

const bucket = firebase.storage().bucket();
const database = firebase.firestore().collection("storageLog");
moment().locale("pt-br");
moment().tz("America/Maceio");

function verifyUserLimits(ip) {
  const promise = new Promise(async (resolve, reject) => {
    await database
      .doc(ip)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (data.uploads.quantity >= 7) {
            reject(textPack.storage.upload.limitReached);
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      })
      .catch((err) => {
        console.error(err);
        reject(textPack.storage.upload.limitError);
      });
  });
  return promise;
}

function logUserAction(ip, filename) {
  const promise = new Promise(async (resolve, reject) => {
    await database
      .doc(ip)
      .get()
      .then(async (doc) => {
        if (doc.exists) {
          const data = doc.data();
          await database
            .doc(ip)
            .update({
              uploads: {
                quantity: data.uploads.quantity + 1,
                files: [...data.uploads.files, filename],
              },
            })
            .then(() => {
              resolve();
            })
            .catch((err) => {
              console.error(err);
              reject(textPack.standards.responseError);
            });
        } else {
          await database
            .doc(ip)
            .set({
              uploader: ip,
              uploads: {
                quantity: 1,
                files: [filename],
              },
            })
            .then(() => {
              resolve();
            })
            .catch((err) => {
              console.error(err);
              reject(textPack.standards.responseError);
            });
        }
      });
  });
  return promise;
}

function deleteCloudFile(filename) {
  const promise = new Promise(async (resolve, reject) => {
    const file = bucket.file(filename);
    await file
      .delete()
      .then(() => {
        resolve(textPack.storage.upload.uploadCanceled);
      })
      .catch((err) => {
        console.error(err);
        reject(textPack.storage.upload.uploadCanceledError);
      });
  });
  return promise;
}

function deleteLocalFile(path) {
  try {
    fs.unlinkSync(path);
    return { error: false };
  } catch (err) {
    console.error(err);
    return { error: true, message: textPack.standards.responseError };
  }
}

function moveFile(file, filename) {
  const promise = new Promise((resolve, reject) => {
    const path = `${process.cwd()}/temp/${filename}`;
    file.mv(path, (err) => {
      if (err) {
        console.error(err);
        reject(textPack.standards.responseError);
      }
      resolve(path);
    });
  });
  return promise;
}

function uploadFile(path, checksum) {
  const promise = new Promise(async (resolve, reject) => {
    await bucket
      .upload(path, { gzip: true, validation: checksum })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        console.error(err);
        reject(textPack.standards.responseError);
      });
  });
  return promise;
}

router.post("/", async (req, res) => {
  const performanceLog = new Performance(req.baseUrl);
  if (!req.files) {
    performanceLog.finish();
    return res.status(400).json(response(true, textPack.standards.nullField));
  }

  const ip = req.headers["x-ip"];
  const file = req.files.file;
  const mimeTypes = ["text", "image", "audio", "video"];

  if (file.size > 5242880) {
    performanceLog.finish();
    return res
      .status(400)
      .json(response(true, textPack.storage.upload.fileLimit));
  }

  if (!mimeTypes.includes(file.mimetype.split("/")[0])) {
    performanceLog.finish();
    return res
      .status(400)
      .json(response(true, textPack.storage.upload.fileType));
  }

  let promisesResults = [];

  Promise.resolve(promisesResults)
    .then(async (all) => {
      return await verifyUserLimits(ip)
        .then(() => {
          return all;
        })
        .catch((err) => {
          throw new Error(err);
        });
    })
    .then(async (all) => {
      const filename = moment().format(
        `DD-MM-YYYY_hh-mm-ssa_[${shortid.generate()}.${
          file.mimetype.split("/")[1]
        }]`
      );
      all.push(filename);
      return await moveFile(file, filename)
        .then((path) => {
          all.push(path);
          return all;
        })
        .catch((err) => {
          throw new Error(err);
        });
    })
    .then(async (all) => {
      return await uploadFile(all[1], file.md5)
        .then(() => {
          all.push("uploaded");
          return all;
        })
        .catch((err) => {
          throw new Error(err);
        });
    })
    .then((all) => {
      const fileDeletion = deleteLocalFile(all[1]);
      if (fileDeletion.error) {
        throw new Error(fileDeletion.message);
      }
      return all;
    })
    .then(async (all) => {
      return await logUserAction(ip, all[0])
        .then(() => {
          performanceLog.finish();
          return res.json(
            response(false, textPack.standards.responseOK, {
              filename: all[0],
            })
          );
        })
        .catch((err) => {
          throw new Error(err);
        });
    })
    .catch(async (err) => {
      console.error(err);
      if (promisesResults[2] === "uploaded") {
        await deleteCloudFile(promisesResults[0])
          .then((msg) => {
            performanceLog.finish();
            return res.status(500).json(response(true, msg));
          })
          .catch((error) => {
            performanceLog.finish();
            return res.status(500).json(response(true, error.message));
          });
      } else {
        performanceLog.finish();
        return res.status(500).json(response(true, err.message));
      }
    });
});

export default router;
