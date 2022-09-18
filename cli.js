#!/usr/bin/env node
import process from 'node:process';
import imagemin from './im.js';
import ora from 'ora';

import logger from './logger.js';
import pluginOverride from './plugins.js';
import yargs from 'yargs/yargs';




const defaultOutDir = process.cwd();
var spinner;

const run = async () => {
  var argv = yargs(process.argv.slice(2))
    .usage('Usage: $0 <glob> [options]')
    .alias('o', 'output')
    .describe('o', 'output directory')
    .alias('v', 'verbose')
    .describe('v', 'verbose output').argv;

    const globPattern = argv._[0];
    const outputDir = argv.output || defaultOutDir;
  
  try {
    spinner = ora('Starting');
    spinner.start();
    const plugins = await pluginOverride();

    let numberOfFilesOutput = await imagemin({input: globPattern, destination: outputDir, plugins: plugins});
    spinner.stop();
    logger.info(`the number of files minified was ${numberOfFilesOutput}. written to ${outputDir}`);
  } catch (error) {
    spinner.stop();
    logger.error(error);
  }
};
run();