class CutterComponent {
    constructor(options) {
        if (!options.file) {
            throw new Error('musted have file in the options as source picture')
        }
        if (!options.el) {
            throw new Error('musted have el in the options as place to work ')
        }
        this.file = options.file
        this.el = options.el
        this.targetEl = options.targetEl

        const defaultPan = {
            x: 0,
            y: 0,
            radius: 10,
            // color: 'blue',
        }
        this.pan = {
            ...defaultPan,
            ...options.pan,
        }
        this.panOffest = null

        this.canvas = null
        this.resultCanvas = null
        this.init()
    }

    async init() {
        this.canvas = await this.createCanvas()
        this.resultCanvas = document.createElement('canvas')
        this.resultCanvas.width = this.canvas.width
        this.resultCanvas.height = this.canvas.height

        this.el.innerHTML = ''
        this.el.appendChild(this.canvas)
        this.targetEl.appendChild(this.resultCanvas)

        this.panEl = document.createElement('div')
        this.panEl.style.width = this.pan.radius + 'px'
        this.panEl.style.height = this.pan.radius + 'px'
        this.panEl.style.borderRadius = '50%'
        this.panEl.style.position = 'absolute'
        this.panEl.style.backgroundColor = 'yellow'
        this.panEl.style.transform = 'translate(-50%,-50%)'
        this.panEl.style.pointerEvents = 'none'
        this.panEl.style.display = 'none'
        this.panEl.style.opacity = 0.5

        this.panOffest = {
            left: this.canvas.offsetLeft, //canvasStyle.left.slice(0, -2) - 0,
            top: this.canvas.offsetTop, // canvasStyle.top.slice(0, -2) - 0,
        }
        this.el.appendChild(this.panEl)

        // 绘制画笔
        this.drawPan = this._drawPan.bind(this)

        // 绑定 画笔马赛克操作（点击，移动，放起）
        this.bindEvent()
    }

    // 创建画布并且画好图片
    async createCanvas() {
        const fileData = await readFile(this.file)
        const imgEl = await createImgEl(fileData)

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.position = 'relative'

        // 图片大小适配
        // const proportion = imgEl.naturalWidth / imgEl.naturalHeight
        const containerStyle = window.getComputedStyle(this.el)
        const maxWidth = containerStyle.width.slice(0, -2)
        const maxHeight = containerStyle.height.slice(0, -2)
        let width = imgEl.naturalWidth
        let height = imgEl.naturalHeight
        if (width > maxWidth) {
            width = maxWidth
            height = Math.floor((width / maxWidth) * maxHeight)
        } else if (height > maxHeight) {
            width = Math.floor((height * maxWidth) / maxHeight)
            height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        ctx.drawImage(imgEl, 0, 0, width, height)

        return canvas
    }

    bindEvent() {
        // 画笔操作
        let isDraw = false
        this.canvas.addEventListener('mousedown', (e) => {
            isDraw = true
        })
        this.canvas.addEventListener('mousemove', (e) => {
            this.pan.x = e.offsetX
            this.pan.y = e.offsetY
            if (isDraw) {
                this.cutter()
            }
            // ref = window.requestAnimationFrame(this.pan.draw(e))
        })
        this.canvas.addEventListener('mouseup', (e) => {
            isDraw = false
        })

        // 画笔ui
        this.raf = null
        this.canvas.addEventListener('mouseover', (e) => {
            this.panEl.style.display = 'block'
            this.raf = window.requestAnimationFrame(this.drawPan)
        })

        this.canvas.addEventListener('mouseout', (e) => {
            this.panEl.style.display = 'none'
            window.cancelAnimationFrame(this.raf)
        })
    }

    cutter() {
        const ctx = this.canvas.getContext('2d')
        const resCtx = this.resultCanvas.getContext('2d')

        let left = this.pan.x - Math.floor(this.pan.radius / 2)
        left = left == 0 ? 0 : left
        let top = this.pan.y - Math.floor(this.pan.radius / 2)
        top = top == 0 ? 0 : top
        
        const imgData = ctx.getImageData(
            // this.pan.x,
            // this.pan.y,
            left,
            top,
            this.pan.radius,
            this.pan.radius
        )
        resCtx.putImageData(imgData, left, top) //this.pan.x, this.pan.y)
    }

    setPan(options) {
        this.pan = {
            ...this.pan,
            ...options,
        }
        this.panEl.style.width = this.pan.radius + 'px'
        this.panEl.style.height = this.pan.radius + 'px'
    }

    _drawPan() {
        this.panEl.style.left = `${this.panOffest.left + this.pan.x}px`
        this.panEl.style.top = `${this.panOffest.top + this.pan.y}px`
        this.raf = window.requestAnimationFrame(this.drawPan)
    }
}

