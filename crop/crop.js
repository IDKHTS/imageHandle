async function crop(sourceFile, options) {
    // 读取源图片数据
    const sourceFileData = await readFile(sourceFile)
    console.log(sourceFileData)
    
    // 生成对应的Image元素（获取源图片宽高和绘制sourceCanvas）
    const imgEl = await createImgEl(sourceFileData)

    // 处理截图的位置，宽高
    // targetTop, targetLeft, targetWidth, targetHeight
    const defaultOptions = {
        top: 0,
        left: 0,
        width: imgEl.naturalWidth,
        height: imgEl.naturalHeight,
        type: 'image/jpeg'
    }
    const realOptions = {
        ...defaultOptions,
        ...options,
    }
    console.log('realOptions', realOptions)

    // 绘制原图
    // 获取原图宽高
    const scWidth = imgEl.naturalWidth
    const scHeight = imgEl.naturalHeight
    // 创建sourceCanvas，宽高和原图一样
    const sourceCanvas = document.createElement('CANVAS')
    sourceCanvas.width = scWidth
    sourceCanvas.height = scHeight
    const sourceCtx = sourceCanvas.getContext('2d')
    sourceCtx.drawImage(img, 0, 0, scWidth, scHeight)

    // 截图
    // 创建resultCanvas
    const resultCanvas = document.createElement('canvas')
    resultCanvas.width = realOptions.width
    resultCanvas.height = realOptions.height
    const resultCtx = resultCanvas.getContext('2d')
    // 把截取画面绘制经resultCanvas
    resultCtx.drawImage(
        sourceCanvas,
        realOptions.left,
        realOptions.top,
        realOptions.width,
        realOptions.height,
        0,
        0,
        realOptions.width,
        realOptions.height
    )

    // 导出
    const code = resultCanvas.toDataURL(realOptions.type, 1)
    
    return code
}
