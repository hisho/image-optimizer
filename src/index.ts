import minimist from 'minimist'
import chokidar from 'chokidar'
import path from 'path'
import { config } from './confg'
import fs from 'fs'
import glob from 'glob'
import sharp from 'sharp'
import sizeOf from 'image-size'
import dayjs from 'dayjs'

type argvType = Readonly<{
  watch: string
}>

export const main = async (args: string[]) => {
  const argv = minimist<argvType>(args, {
    string: ['watch'],
    alias: { w: 'watch' },
  })

  const resolvedConfig = { ...config }

  /**
   * 画像一覧を取得する
   * [hoge.png, hoge/fuga.png]
   */
  const getImagePath = () => {
    return glob.sync(`**/*.+(png|jpg)`, {
      cwd: path.resolve(process.cwd(), resolvedConfig.src),
    })
  }

  /**
   * フロント側でほしいpathを作成する
   * hoge.png -> /images/hoge.png
   * huga/hoge.png -> /images/huga/hoge.png
   */
  const pathJoinImagesDir = (...paths: string[]) => {
    return path.join('/images/', ...paths)
  }

  const createImageFileName = (
    {
      name,
      deviceSize,
      ext,
      isWebp = false,
    }: {
      name: string
      deviceSize: number
      ext: string
      isWebp?: boolean
    },
    ...params: string[]
  ) => {
    const param = params.length > 0 ? `?${params.join('')}` : ''
    return `${name}-w${deviceSize}${ext}${isWebp ? '.webp' : ''}${param}`
  }

  /**
   * すべての画像を取得してresolvedConfig.deviceSizesのsizeにリネームしたJSONを作成する
   *
   * @type {
   *   width: number, // 画像の幅
   *   height: number, // 画像の高さ
   *   original: string, // フロントで使う画像のpath(/images/hoge.png)
   *   paths: {
   *    deviceSize: number, // フロントで使うデバイスサイズ(resolvedConfig.deviceSizes一つ一つ)
   *    original: string, // フロントで使う元の画像をdeviceSizeにリネームしたものpath(/images/hoge-w{deviceSizes一つ一つ}.png)
   *    webp: string, // フロントで使う元の画像をwebpにしdeviceSizeにリネームしたものpath(/images/hoge-w{deviceSizes一つ一つ}.png.webp)
   *   }[]
   * }[]
   */
  const createImageMapping = () => {
    const imagePaths = getImagePath()
    return imagePaths.map((currentPath) => {
      const { dir, name, ext } = path.parse(currentPath)
      const imagePath = path.join(resolvedConfig.src, currentPath)
      const stat = fs.statSync(imagePath)
      const updateTime = dayjs(stat.mtime).format('YYYYMMDDHHmmss')
      const { width, height } = sizeOf(imagePath)
      const spName = `${name}_sp`
      const mobileImageName = imagePaths.find((n) => {
        const nName = path.parse(n)
        return nName.name.endsWith(spName)
      })
      return {
        width,
        height,
        original: pathJoinImagesDir(currentPath),
        mobileImageName: mobileImageName
          ? pathJoinImagesDir(mobileImageName)
          : null,
        paths: resolvedConfig.deviceSizes.map((deviceSize) => {
          return {
            size: deviceSize,
            original: pathJoinImagesDir(
              dir,
              createImageFileName({ name, deviceSize, ext }, updateTime)
            ),
            webp: pathJoinImagesDir(
              dir,
              createImageFileName(
                { name, deviceSize, ext, isWebp: true },
                updateTime
              )
            ),
          }
        }),
      }
    })
  }

  const createImageMetaData = () => {
    const imageMapping = createImageMapping()
    const destPath = 'src/lib'

    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true })
    }

    fs.writeFile(
      `src/lib/$images.ts`,
      `/* eslint-disable */
// prettier-ignore
export const imagesPath = ${JSON.stringify(imageMapping, null, '\t')} as const;
export type ImagesPath = typeof imagesPath`,
      () => {}
    )
  }

  const write = async (currentPath: string) => {
    const { base: fileName, ext, name } = path.parse(currentPath)

    /**
     * srcのpathを割り出してdistのpathを連結する
     * 'src/images/hoge.png' -> 'public/images/hoge.png'
     * 'src/images/hoge/fuga.png' -> 'public/images/hoge/fuga.png'
     */
    const destPath = path
      .join(resolvedConfig.dest, path.dirname(currentPath), '/')
      .replace(new RegExp(resolvedConfig.src), '')

    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true })
    }

    const sharpStream = sharp(currentPath)
    const isPngImage = path.extname(fileName) === '.png'
    const createDeviceSizes = () =>
      resolvedConfig.deviceSizes.map((deviceSize) =>
        sharpStream
          .resize(deviceSize)
          [isPngImage ? 'png' : 'jpeg']({
            quality:
              resolvedConfig.imageMin[isPngImage ? 'png' : 'jpeg'].quality,
          })
          .toFile(
            path.join(destPath, createImageFileName({ name, deviceSize, ext }))
          )
      )

    const createWebpDeviceSizes = () =>
      resolvedConfig.deviceSizes.map((deviceSize) =>
        sharpStream
          .resize(deviceSize)
          .webp({
            quality: resolvedConfig.imageMin.webp.quality,
          })
          .toFile(
            path.join(
              destPath,
              createImageFileName({ name, deviceSize, ext, isWebp: true })
            )
          )
      )

    try {
      await Promise.all([...createDeviceSizes(), ...createWebpDeviceSizes()])
    } catch (e) {
      console.log(`error! ${currentPath}`)
    }
  }

  if (argv.watch !== undefined) {
    chokidar
      .watch(
        ['**/*.png', '**/*.jpg'].map((n) => path.join(resolvedConfig.src, n)),
        {
          ignoreInitial: true,
        }
      )
      .on('all', (eventName, path) => {
        console.log('Watching...', eventName, path)
        write(path)
        createImageMetaData()
      })
  } else {
    getImagePath().forEach((imagePath) => {
      const imagePathWithSrc = path.join(resolvedConfig.src, imagePath)
      console.log('Building...', imagePathWithSrc)
      write(imagePathWithSrc)
    })
    createImageMetaData()
  }
}
