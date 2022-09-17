import pino from 'pino';
import {homedir} from 'os';
import path from 'path';
import pretty from 'pino-pretty';
import fs from 'fs';

const appName = "imagemin";

const fileParentFolder = path.join(homedir(),'.config', `${appName}`);
if (!fs.existsSync(fileParentFolder)){
  fs.mkdirSync(fileParentFolder, { recursive: true });
}
const fileLocation = path.join(fileParentFolder, `${appName}.log`);


const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: {destination: fileLocation},
    },
    {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  ],
});
const logger = pino(transport);
export default logger;
