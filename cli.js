#!/usr/bin/env node
import process from 'node:process'
import imagemin from './im.js'
import path from 'node:path'
import chalk from 'chalk'
import pluginOverride from './plugins.js'
import yargs from 'yargs/yargs'
import { existsSync, mkdirSync } from 'node:fs'
import notifier from 'node-notifier'

const agentIsMacosAutomator = () => {
    let returnVal = false
    if (process.env['XPC_SERVICE_NAME']) {
        if (
            process.env['XPC_SERVICE_NAME']
                .toLowerCase()
                .indexOf('com.apple.automator') > -1
        ) {
            returnVal = true
        }
    }
    return returnVal
}
//const getOutputDir = (input) => {

const defaultOutDir = process.cwd()

const log = (message) => {
    if (!agentIsMacosAutomator()) {
        console.log(message)
    }
    else {
        notifier.notify({
            title: 'imagemin',
            message: message,
        })
    }
}

const run = async () => {
    let globPattern;
    let outputDir = defaultOutDir;
    var argv = yargs(process.argv.slice(2))
        .usage('Usage: $0 <glob> [options]')
        .alias('o', 'output')
        .describe('o', 'output directory')
        .example([['$0 "./pictures-of-cats/*.png"', 'self-explanatory']])
        .version(process.env.npm_package_version).argv

    globPattern = argv._[0]

    if (agentIsMacosAutomator()) {
        globPattern = process.argv.slice(2);
        outputDir = path.dirname(globPattern[0])
    }
    
    if (argv.output) {
        outputDir = argv.output
    }
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true })
    }

    try {
        const plugins = await pluginOverride()
        let numberOfFilesOutput = await imagemin({
            input: globPattern,
            destination: outputDir,
            plugins: plugins,
        })

        log(
            `${
                numberOfFilesOutput > 0
                    ? chalk.green(numberOfFilesOutput)
                    : chalk.red(numberOfFilesOutput)
            } ${chalk.green(
                `file(s) were minified and saved to ${path.resolve(outputDir)}`
            )}`
        )
    } catch (error) {
        log(`error: ${error}`)
    }
}
run()
