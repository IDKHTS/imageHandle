// 读取文件，返回Promise
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

// 根据fileData创建Image元素并返回，返回Promise
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

// 创建tag标签，子元素是children，children若为字符串，则标签内容为这字符串
function creatEL(tag, children) {
    let el = document.createElement(tag);
    if (children && Array.isArray(children)) {
        children.forEach((v) => el.appendChild(v));
    } else if (children && typeof children == "object") {
        el.appendChild(children);
    } else if (children) {
        el.innerHTML = children;
    }
    return el;
}
