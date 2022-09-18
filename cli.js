#!/usr/bin/env node
import process from 'node:process';
import imagemin from './im.js';
import path from 'node:path';
import logger from './logger.js';
import pluginOverride from './plugins.js';
import yargs from 'yargs/yargs';




const defaultOutDir = process.cwd();


const run = async () => {
  var argv = yargs(process.argv.slice(2))
    .usage('Usage: $0 <glob> [options]')
    .alias('o', 'output')
    .describe('o', 'output directory')
    .example([
      ['$0 "./pictures-of-cats/*.png"', 'self-explanatory'],
    ])
    .version(process.env.npm_package_version)
    .argv;

    const globPattern = argv._[0];
    const outputDir = argv.output || defaultOutDir;
  
  try {
    const plugins = await pluginOverride();
    let numberOfFilesOutput = await imagemin({input: globPattern, destination: outputDir, plugins: plugins});

    logger.info(`the number of files minified was ${numberOfFilesOutput}. written to ${path.resolve(outputDir)}`);
  } catch (error) {
  
    logger.error(error);
  }
};
run();