import { readFile, writeFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'path'
import { fileTypeFromBuffer } from 'file-type'
import { globby } from 'globby'
import promisePipe from 'promise.pipe'
import logger from './logger.js'
import prettyBytes from 'pretty-bytes';

const replaceExt = (path, newExtension) => {
    const filenname = path.substring(0, path.lastIndexOf('.'))
    return filenname + '.' + newExtension
}

const getFilesize = async (filename) => {
    const stats = await stat(filename)
    const fileSizeInBytes = stats.size
    return fileSizeInBytes
}

const handleFile = async (input, output, plugins) => {
    let ret = false
    try {
        let filePath = path.resolve(input)
        let originalSize = await getFilesize(filePath)
        let data = await readFile(filePath)

        const { name, ext } = path.parse(input)
        const dest = path.join(output, `${name}-smashed${ext}`)

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
        let outputFilename = checkFileExists(outputPath)
  
      
        await writeFile(outputFilename, buf, { flag: 'wx' })
        let outputSize = await getFilesize(outputFilename)
        let percent = Math.round((outputSize / originalSize) * 100)
        logger.info(`${path.basename(outputPath)} -> ${path.basename(outputFilename)}. ${percent}% smaller. (${prettyBytes(originalSize)} -> ${prettyBytes(outputSize)})`)
        ret = true;
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
        newFilename = filename.replace(/(\.[^.]+)$/, `(${i})$1`)
        i++
    }
    return newFilename
}

const imagemin = async ({ input, destination, plugins }) => {
    let paths = await globby(input, {
        expandDirectories: {
            extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'],
        },
    })
    let filesOutput = await Promise.all(
        paths.map((filePath) => handleFile(filePath, destination, plugins))
    )
    let filesSucceeded = filesOutput.filter((x) => x !== false).length
    return filesSucceeded
}

export default imagemin
