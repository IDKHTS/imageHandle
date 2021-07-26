// 截取sourceFile中options内位置信息的图片，返回base64
async function crop(sourceFile, options) {
    // 读取源图片数据
    const sourceFileData = await readFile(sourceFile)

    // 生成对应的Image元素（获取源图片宽高和绘制sourceCanvas）
    const imgEl = await createImgEl(sourceFileData)

    // 处理截图的位置，宽高
    // targetTop, targetLeft, targetWidth, targetHeight
    const defaultOptions = {
        top: 0,
        left: 0,
        width: imgEl.naturalWidth,
        height: imgEl.naturalHeight,
        type: 'image/jpeg',
    }
    const realOptions = {
        ...defaultOptions,
        ...options,
    }

    // 截图
    // 创建resultCanvas
    const resultCanvas = document.createElement('canvas')
    resultCanvas.width = realOptions.width
    resultCanvas.height = realOptions.height
    const resultCtx = resultCanvas.getContext('2d')
    // 把截取画面绘制经resultCanvas
    resultCtx.drawImage(
        imgEl,
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

// 截图工作台ui组件
// const cropComponent = new CropComponent(file,{el,containerEl})
// cropComponent.build() // 构建截取框
// const positionMsg = cropComponent.getPositionMsg() // 获取截取位置信息（可直接传递给crop的第二参数）
class CropComponent {
    constructor(file, options) {
        if (!options.el) {
            throw new Error('there must have a el as mounted point')
        }
        this.file = file
        this.el = options.el // 用作“父元素”
        this.containerEl = options.containerEl
        this.cutFieldEl = null
        this.moveFielEl = null
        this.mouseCtx = null
        this.moveMouseCtx = null

        this.move = this._move.bind(this)
        this.expand = this._expand.bind(this)
    }

    // 创建工作台
    async build() {
        // 读取源图片数据
        const sourceFileData = await readFile(this.file)

        // 生成对应的Image元素（获取源图片宽高和作为工作台）
        const imgEl = await createImgEl(sourceFileData)

        const naturalWidth = imgEl.naturalWidth
        const naturalHeight = imgEl.naturalHeight

        this.el.style.position = `relative`
        this.el.style.width = `${naturalWidth}px`
        this.el.style.height = `${naturalHeight}px`
        this.el.style.background = `url(${sourceFileData}) no-repeat`
        this.el.style.backgroundSize = '100% 100%'
        this.createCropBox()
    }

    // 创建裁剪框（带伸缩点）
    createCropBox() {
        this.cutFieldEl = document.createElement('div')
        this.cutFieldEl.classList.add('cropbox')
        this.moveFielEl = document.createElement('div')
        this.moveFielEl.classList.add('moveField')

        // 裁剪框的移动事件监听
        this.mouseCtx = {
            isMouseDown: false,
            x: 0,
            y: 0,
        }
        this.cutFieldEl.addEventListener(
            'mousedown',
            (e) => {
                // console.log('mousedown')
                this.mouseCtx = {
                    isMouseDown: true,
                    x: e.pageX,
                    y: e.pageY,
                }
            },
            false
        )
        this.cutFieldEl.addEventListener(
            'mousemove',
            throttle(5, (e) => {
                // 裁剪框的移动
                if (this.mouseCtx.isMouseDown) {
                    this.move(e)
                }
                // 裁剪框的缩放
                if (this.moveMouseCtx.isMouseDown) {
                    this.expand(e)
                }
            }),
            false
        )
        this.cutFieldEl.addEventListener(
            'mouseup',
            (e) => {
                // console.log('mouseup', e)
                this.mouseCtx.isMouseDown = false
            },
            false
        )

        // 裁剪框的缩放事件监听
        this.moveMouseCtx = {
            isMouseDown: false,
            x: 0,
            y: 0,
        }
        this.moveFielEl.addEventListener('mousedown', (e) => {
            e.stopPropagation()
            // console.log('move mousedown')
            this.moveMouseCtx = {
                isMouseDown: true,
                x: e.pageX,
                y: e.pageY,
            }
        })
        this.moveFielEl.addEventListener(
            'mousemove',
            throttle(5, (e) => {
                e.stopPropagation()
                if (this.moveMouseCtx.isMouseDown) {
                    this.expand(e)
                }
            })
        )
        this.moveFielEl.addEventListener('mouseup', (e) => {
            e.stopPropagation()
            // console.log('move mouseup', e)
            this.moveMouseCtx.isMouseDown = false
        })

        // 如果需要，也绑定控制事件到容器元素上
        if (this.containerEl) {
            this.handleContainer()
        }

        this.el.appendChild(this.cutFieldEl)
        this.cutFieldEl.appendChild(this.moveFielEl)
    }

    // 截取框移动逻辑
    _move(e) {
        const offsetX = e.pageX - this.mouseCtx.x
        const offsetY = e.pageY - this.mouseCtx.y

        // 校验不能移出图片工作区
        const cutFieldStyle = window.getComputedStyle(this.cutFieldEl)
        const workspaceStyle = window.getComputedStyle(this.el)
        let left = cutFieldStyle.left.slice(0, -2) - 0 + offsetX
        let top = cutFieldStyle.top.slice(0, -2) - 0 + offsetY
        const maxLeft =
            workspaceStyle.width.slice(0, -2) - cutFieldStyle.width.slice(0, -2)
        const maxTop =
            workspaceStyle.height.slice(0, -2) -
            cutFieldStyle.height.slice(0, -2)
        left = left < 0 ? 0 : left
        left = left > maxLeft ? maxLeft : left
        top = top < 0 ? 0 : top
        top = top > maxTop ? maxTop : top

        this.cutFieldEl.style.left = left + 'px'
        this.cutFieldEl.style.top = top + 'px'
        this.mouseCtx.x += offsetX
        this.mouseCtx.y += offsetY
    }
    // 截取框拉伸扩展逻辑
    _expand(e) {
        const offsetX = e.pageX - this.moveMouseCtx.x
        const offsetY = e.pageY - this.moveMouseCtx.y

        // 裁剪区域扩大
        const cutFieldStyle = window.getComputedStyle(this.cutFieldEl)
        const workspaceStyle = window.getComputedStyle(this.el)
        let width = cutFieldStyle.width.slice(0, -2) - 0
        let height = cutFieldStyle.height.slice(0, -2) - 0
        width = width + offsetX
        height = height + offsetY
        const maxWidth =
            workspaceStyle.width.slice(0, -2) - cutFieldStyle.left.slice(0, -2)
        const maxHeight =
            workspaceStyle.height.slice(0, -2) - cutFieldStyle.top.slice(0, -2)
        width = width < 0 ? 0 : width
        width = width > maxWidth ? maxWidth : width
        height = height < 0 ? 0 : height
        height = height > maxHeight ? maxHeight : height

        this.cutFieldEl.style.width = width + 'px'
        this.cutFieldEl.style.height = height + 'px'

        this.moveMouseCtx.x += offsetX
        this.moveMouseCtx.y += offsetY
    }

    // 【优化】处理container元素，让这个区域也接受鼠标松开/按下的截取框移动或者拉伸扩展逻辑
    handleContainer() {
        this.containerEl.addEventListener(
            'mousemove',
            throttle(10, (e) => {
                e.stopPropagation()
                // 裁剪框的移动
                if (this.mouseCtx.isMouseDown) {
                    this.move(e)
                }
                if (this.moveMouseCtx.isMouseDown) {
                    this.expand(e)
                }
            })
        )

        this.containerEl.addEventListener('mouseup', (e) => {
            e.stopPropagation()
            this.moveMouseCtx.isMouseDown = false
            this.mouseCtx.isMouseDown = false
        })
    }

    // 获取当前的截取框位置宽高信息
    getPositionMsg() {
        const cutFieldStyle = window.getComputedStyle(this.cutFieldEl)
        return {
            top: cutFieldStyle.top.slice(0, -2) - 0,
            left: cutFieldStyle.left.slice(0, -2) - 0,
            width: cutFieldStyle.width.slice(0, -2) - 0,
            height: cutFieldStyle.height.slice(0, -2) - 0,
        }
    }
}