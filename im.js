import { readFile, writeFile } from 'node:fs/promises'
import {existsSync} from 'node:fs'
import path from 'path'
import { fileTypeFromBuffer } from 'file-type'
import { globby } from 'globby'
import promisePipe from 'promise.pipe'
import logger from './logger.js'

const replaceExt = (path, newExtension) => {
    const index = path.lastIndexOf('.')
    const filenname = path.substring(0, path.lastIndexOf('.'))
    return filenname + '.' + newExtension
}

const handleFile = async (input, output, plugins) => {
    let ret = false
    try {
        let filePath = path.resolve(input)
        let data = await readFile(filePath)
      
        const {name, ext, dir} = path.parse(input);
        const dest = path.join(output, `${name}-smashed${ext}`);

        const pipe =
            plugins.length > 0
                ? promisePipe(plugins)(data)
                : Promise.resolve(data)
        let buf = await pipe
        buf = buf.length < data.length ? buf : data

        let outputPath =
            fileTypeFromBuffer(buf) && fileTypeFromBuffer(buf).ext === 'webp'
                ? replaceExt(dest, '.webp')
                : dest
        let outputFilename = checkFileExists(outputPath);
        if (outputFilename !== outputPath) {
            logger.info(`file ${outputPath} already exists. writing to ${outputFilename}`)
        }
        await writeFile(outputFilename, buf, { flag: 'wx' })
        ret = true
    } catch (e) {
        logger.error(`issue with ${input}: ${e}`)
    }
    return ret
}
//function to check if destination filename exists, and if so, to rename it with a number
const checkFileExists = (filename) => {
    let i = 1
    let newFilename = filename
    while (existsSync(newFilename)) {
        newFilename = filename.replace(/(\.[^\.]+)$/, `(${i})$1`)
        i++
    }
    return newFilename
}

const imagemin = async ({ input, destination, plugins }) => {
    let paths = await globby(input, {
        expandDirectories: {
            extensions: ['png'],
        },
    })
    let filesOutput = await Promise.all(
        paths.map((filePath) => handleFile(filePath, destination, plugins))
    )
    let filesSucceeded = filesOutput.filter((x) => x === true).length
    return filesSucceeded
}

const buffer = (input, opts) => {
    if (!Buffer.isBuffer(input)) {
        return Promise.reject(new TypeError('Expected a buffer'))
    }

    opts = Object.assign({ plugins: [] }, opts)
    opts.plugins = opts.use || opts.plugins

    const pipe =
        opts.plugins.length > 0
            ? promisePipe(opts.plugins)(input)
            : Promise.resolve(input)

    return pipe.then((buf) => (buf.length < input.length ? buf : input))
}

export default imagemin
