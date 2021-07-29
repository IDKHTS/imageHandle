async function stitch(files) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // const fileData = await readFile(files[0])
    // const imgEl = await createImgEl(fileData)

    // ctx.drawImage(imgEl, 0, 0, imgEl.naturalWidth, imgEl.naturalHeight)

    let top = 0
    let maxWidth = 0
    const imgArr = []
    for (let i = 0; i < files.length; i++) {
        const fileData = await readFile(files[i])
        const imgEl = await createImgEl(fileData)
        imgArr.push({
            img: imgEl,
            width: imgEl.naturalWidth,
            height: imgEl.naturalHeight,
        })
        top += imgEl.naturalHeight
        maxWidth = Math.max(imgEl.naturalWidth, maxWidth)
    }
    canvas.width = maxWidth
    canvas.height = top

    top = 0
    for (let i = 0; i < imgArr.length; i++) {
        const curr = imgArr[i]
        ctx.drawImage(curr.img, 0, top, curr.width, curr.height)
        top += curr.height
    }

    return canvas
}
