async function compress(file, options = { type: 'image/png', quality: 0.8 }) {
    const type = options.type
    const quality = options.quality || 0.8
    
    const fileData = await readFile(file)
    const imgEl = await createImgEl(fileData)
    const canvas = getCompressCanvas(imgEl)
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => resolve(blob), type, quality)
    })
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function (data) {
            console.log('FileReader', data)
            resolve(reader.result)
        }
        reader.onerror = (err) => reject(err)
    })
}

function createImgEl(fileData) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = fileData
        img.onload = function (e) {
            console.log(e)
            resolve(img)
        }
        img.onerror = (err) => reject(err)
    })
}

function getCompressCanvas(imgEl) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = imgEl.naturalWidth
    canvas.height = imgEl.naturalHeight

    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height)

    return canvas
}
