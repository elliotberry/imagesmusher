import { readFile, writeFile } from 'node:fs/promises'
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
    let filePath = path.resolve(input)
    let data = await readFile(filePath)
    const dest = path.join(output, path.basename(input))

    const pipe =
        plugins.length > 0 ? promisePipe(plugins)(data) : Promise.resolve(data)
    let buf = await pipe
    buf = buf.length < data.length ? buf : data

    let outputPath =
        fileTypeFromBuffer(buf) && fileTypeFromBuffer(buf).ext === 'webp'
            ? replaceExt(dest, '.webp')
            : dest
    await writeFile(outputPath, buf)
}

const imagemin = async ({ input, destination, plugins }) => {
    try {
        let paths = await globby(input, {
            expandDirectories: {
                extensions: ['png'],
            },
        })
        let r = await Promise.all(
            paths.map((filePath) => handleFile(filePath, destination, plugins))
        )
        return r
    } catch (e) {
        logger.error(e)
    }
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
