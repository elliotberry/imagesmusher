#!/usr/bin/env node
import process from 'node:process';
import imagemin from './im.js';
import ora from 'ora';
import plur from 'plur';
import {homedir} from 'os';
import path from 'path';
import logger from './logger.js';
import pluginOverride from './plugins.js';
import fs from 'node:fs';

const defaultOutDir = path.join(homedir(), 'imagemin');
if (!fs.existsSync(defaultOutDir)){
  fs.mkdirSync(defaultOutDir);
}
var spinner;

const run = async (input, outDir = defaultOutDir) => {
  try {
    spinner = ora('Starting');
    spinner.start();
    const plugins = await pluginOverride();
    let files;
    files = await imagemin({input: input, destination: outDir, plugins: plugins});
    spinner.stop();

    logger.info(`${files.length} ${plur('image', files.length)} minified and written to ${outDir}`);
  } catch (error) {
    spinner.stop();
    logger.error(error);
  }
};

(async () => {
  await run(process.argv[2]);
})();
