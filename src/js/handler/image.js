/**
 * Created by Capricorncd.
 * User: https://github.com/capricorncd
 * Date: 2018/9/28 10:31
 */
import { document } from 'ssr-window'
import util from '../util'
import calculator from '../calculator'
import { manualCrop } from '../manual-crop/index'

/**
 * 图片文件或base64数据处理
 * @param file 图片文件或base64数据
 * @param opts 裁剪、处理参数
 * @return {Promise}
 */
export function handleImageFile(opts = {}) {
  return new Promise((resolve, reject) => {
    // base64数据
    let image = document.createElement('img')
    image.setAttribute('crossOrigin', 'Anonymous')
    image.src = opts.selector
    image.onload = () => {
      handleBase64(getBase64(image), opts, resolve, reject)
    }

  })
}
/**
 * URL转base64
 */
function getBase64(img) {
  var canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height

  var ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, img.width, img.height)

  var dataURL = canvas.toDataURL('image/png')
  return dataURL
}

/**
 * 处理base64数据
 * @param base64 base64数据
 * @param opts 图片处理参数
 * @param resolve 成功回调
 * @param reject 错误回调
 */
function handleBase64(base64, opts, resolve, reject) {
  let type = /^data:(.+?);base64/.test(base64) ? RegExp.$1 : 'image/jpeg'
  let blob = util.toBlobData(base64, type)
  let $img = craeteImage(base64)
  // onload
  $img.onload = function () {
    let info = {
      element: $img,
      base64,
      width: $img.naturalWidth || $img.width,
      height: $img.naturalHeight || $img.height,
      type: blob.type,
      size: blob.size
    }
    // 是否裁剪图片
    let isCrop = opts.width > 0 && opts.height > 0
    // 自动裁剪或等比缩放
    if (opts.auto || !isCrop) {
      autoCropImage(info, opts, resolve)
    } else {
      manualCrop(info, opts, resolve, reject)
    }
  }
  // error
  $img.onerror = function (err) {
    reject(err)
  }
}

/**
 * 创建图片对象
 * @param url
 * @return {Element}
 */
function craeteImage(url) {
  const $image = document.createElement('img')
  $image.src = url
  return $image
}

/**
 * 自动裁剪或等比缩放图片
 * @param info 图片数据及参数
 * @param opts 裁剪缩放参数
 * @param resolve 回调函数
 */
function autoCropImage(info, opts, resolve) {
  let clipInfo, $canvas, scaling, sw, sh, sx, sy
  // 计算图片缩放或裁剪位置、尺寸
  clipInfo = calculator.autoCropInfo(info.width, info.height, opts)
  // App.log(clipInfo)
  $canvas = info.element
  scaling = 2
  sw = clipInfo.sw
  sh = clipInfo.sh
  sx = clipInfo.sx
  sy = clipInfo.sy
  if (clipInfo.scaling > scaling) {
    scaling = clipInfo.scaling
    do {
      $canvas = createCanvas($canvas, {
        cw: clipInfo.cw * scaling,
        ch: clipInfo.ch * scaling,
        sx: sx,
        sy: sy,
        sw: sw,
        sh: sh
      })
      sw = $canvas.width
      sh = $canvas.height
      sx = sy = 0
      scaling -= 1
    } while (scaling > 2)
  }
  $canvas = createCanvas($canvas, {
    cw: clipInfo.cw,
    ch: clipInfo.ch,
    sx: sx,
    sy: sy,
    sw: sw,
    sh: sh
  })

  let base64 = $canvas.toDataURL(info.type)
  let blob = util.toBlobData(base64, info.type)

  resolve({
    element: $canvas,
    type: blob.type,
    width: clipInfo.cw,
    height: clipInfo.ch,
    blob,
    url: util.toBlobUrl(blob),
    base64,
    size: blob.size,
    // 原始图片数据
    raw: info
  })
}

/**
 * 创建Canvas
 * @param elm Image对象或Canvas元素
 * @param p 裁剪参数
 * @returns {Element}
 */
function createCanvas(elm, p) {
  const $canvas = document.createElement('canvas')
  $canvas.width = p.cw
  $canvas.height = p.ch
  const ctx = $canvas.getContext('2d')
  ctx.drawImage(elm, p.sx, p.sy, p.sw, p.sh, 0, 0, $canvas.width, $canvas.height)
  return $canvas
}
