// 读取文件，返回Promise
function readFile(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function (data) {
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

function throttle(delay, fn) {
    let cando = true
    return function (...args) {
        if (cando) {
            fn.apply(this, args)
            cando = false
            setTimeout(() => {
                cando = true
            }, delay);
        }
    }

}


// ImageData获取x行y列颜色为color，obj为ImageData数据对象
function getXY(obj, x, y) {
    const w = obj.width;
    // var h = obj.height;
    // var d = obj.data;
    let color = [];
    color[0] = obj.data[4 * (y * w + x)];
    color[1] = obj.data[4 * (y * w + x) + 1];
    color[2] = obj.data[4 * (y * w + x) + 2];
    color[3] = obj.data[4 * (y * w + x) + 3];
    return color;
}

// ImageData设置x行y列颜色为color，obj为ImageData数据对象
function setXY(obj, x, y, color) {
    var w = obj.width;
    // var h = obj.height;
    // var d = obj.data;
    obj.data[4 * (y * w + x)] = color[0];
    obj.data[4 * (y * w + x) + 1] = color[1];
    obj.data[4 * (y * w + x) + 2] = color[2];
    obj.data[4 * (y * w + x) + 3] = color[3];
}