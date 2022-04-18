
import fs from 'fs';
import glob from "glob";
import path from "path";
const imageExtypes = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
const getFileList = (paths) => {
    return new Promise((resolve, reject) => {
      glob(paths, function (er, files) {
        if (er) {
          reject(er);
        } else {
          resolve(files);
        }
      });
    });
  };

const filterOnlyImages = async (input) => {
    let files = await getFileList(input);
    return files.filter(file => {
        return imageExtypes.includes(path.extname(file.path));
    });
}
export default filterOnlyImages;