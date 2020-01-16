/**
 * Created by Capricorncd
 * https://github.com/capricorncd
 * 2018-10-02 22:05
 */
import util from '../util'
import { handleVideoFile } from './video'
import { handleImageFile } from './image'

/**
 * 处理媒体文件
 * @param file 文件
 * @param opts 处理参数
 * @returns {Promise}
 */
export function handleMediaFile(opts) {
  return new Promise((resolve, reject) => {
    // check file type
    if (opts.selector) {
      _handlerFile(RegExp.$1, opts, resolve, reject)
    } else {
      reject({
        code: 7,
        message: 'Incorrect file type'
      })
    }
  })
}

/**
 * 处理视频截图或图片
 * @param file
 * @param type
 * @param opts
 * @param resolve
 * @param reject
 * @private
 */
function _handlerFile(type, opts, resolve, reject) {
  // check file size
  handleImageFile(opts).then(resolve).catch(reject)

}
