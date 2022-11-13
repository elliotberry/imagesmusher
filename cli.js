#!/usr/bin/env node
import process from 'node:process'
import imagemin from './im.js'
import path from 'node:path'
import chalk from 'chalk'
import pluginOverride from './plugins.js'
import yargs from 'yargs/yargs'
import { existsSync, mkdirSync } from 'node:fs'

const defaultOutDir = process.cwd()

const run = async () => {
    var argv = yargs(process.argv.slice(2))
        .usage('Usage: $0 <glob> [options]')
        .alias('o', 'output')
        .describe('o', 'output directory')
        .example([['$0 "./pictures-of-cats/*.png"', 'self-explanatory']])
        .version(process.env.npm_package_version).argv

    const globPattern = argv._[0]
    if (argv.output) {
        if (!existsSync(argv.output)) {
            mkdirSync(argv.output, { recursive: true })
        }
    }

    const outputDir = argv.output || defaultOutDir

    try {
        const plugins = await pluginOverride()
        let numberOfFilesOutput = await imagemin({
            input: globPattern,
            destination: outputDir,
            plugins: plugins,
        })

        console.log(
           `${numberOfFilesOutput > 0 ? chalk.green(numberOfFilesOutput) : chalk.red(numberOfFilesOutput)} ${chalk.green(`file(s) were minified and saved to ${path.resolve(outputDir)}`)}`)
        
    } catch (error) {
        console.error(error)
    }
}
run()
