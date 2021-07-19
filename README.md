# imageHandle

题目 2 答案

## 打开

直接用浏览器打开对应文件即可

-   `index.html`为图片压缩， [参考](https://segmentfault.com/a/1190000023486410)
-   `crop.hml`为图片裁剪 demo，[参考](https://juejin.cn/post/6860024132730519560#heading-5)
-   `masaic.html`为图片马赛克，[参考](https://www.cnblogs.com/liugang-vip/p/5442878.html)

## 思路

### 图片压缩

核心是`canvas`API 的`toBlob(cb, type, quality)`,把canvas绘制的图形导出为blob对象，第三参数就是 0-1 的一个压缩率。

1.  取得本地图片，使用`input[type="file"]`，监听`onchange`，取`inputEl.files[0]`即可（只处理一张）
2.  把本地图片放到`canvas`中，只要利用`canvas`API 的`drawImage(imgEl,top,left,width,height)`,但是缺少对应图片的`Image标签`
3.  input 取得的`File类的实例`要转为`Image标签`，主要可以利用`FileReader.readAsDataURL(file)`，传一个`File类实例`返回`base64数据`，然后把`base64数据`给到`Image.src`即可获取对应图片的`Image标签`
4.  现在图片数据放到了 canvas，调用`toBlob(cb, type, quality)`即可

### 图片裁剪

 核心是`canvasAPI`的`resultCanvas.drawImage(imgEl | sourceCanvasEl,top,left,width,height)`，利用`top`,`left`,`width`,`height`四个参数可以在`参数sourceCanvasEl的图形`里面定义一个**矩形框**，框内的画绘制在`resultCanvas`内。这样相当于把`sourceCanvas`的图形截取到了`resultCanvas`里面，只要把源图片画在`sourceCanvas`中，最终结果就是截取了图片。这里的难点就在于怎么获取四个参数`top`,`left`,`width`,`height`。

 四个参数`top`,`left`,`width`,`height`可以这样获取：定义一对父子元素，父元素背景使用`需要操作的图片`，并且父元素和原图片是**等高等宽**或者**等比例**的和**背景图不重复（no-repeat）**。然后父元素还需要定义为相对定位`position: relative`，给子元素定位的。这样父元素其实就一张图，称为**图片工作台**。接下来就定义子元素，子元素应该是一个**比父元素小的**、**大小（宽高）可以伸缩的**，**半透明的**、**根据父元素相对定位**的区域，子元素就是用于作为裁剪的**裁剪区域**——选取父元素的区域。可以发现，`sourceCanvas`的宽高设置为父元素（图片工作台）的宽高，`resultCanvas`的宽高设置为子元素的宽高（裁剪区域），那么这对父子位置关系就是两个 canvas 的相对位置关系。即子元素（裁剪区域）css 样式的`top`,`left`，是所求的两个参数`top`,`left`的值，子元素的宽高就是所求的`width`,`height`

其余难点：

1.  裁剪区域是可以移动的，也即需要实现一个元素随着鼠标的拖拽移动
    使用 html5 的拖拽？非也，因为拖拽主要还是一个元素里拖动到另外一个元素里（appendChild），没有记录具体的位置（left，top）。
    可以使用`mousedown`，`mousemove`，`mouseup`三个事件。当用户点击裁剪区域时，触发`mousedown`回调，回调里记录当前是拖动开始`isMouseDown = true`并且记录当前位置`startX/Y`（从`参数event`里面的`e.pageX/Y`获取)。当在裁剪区域移动时，触发`mousemove`回调，回调里判断如果`isMouseDown = true`，即在做拖动，获取当前位置和开始位置的偏移`offsetX = e.pageX/Y - startX/Y`，`offsetX/Y`即是移动的方向和距离，赋值给裁剪区域的 css 样式`left`和`top`即可实现拖动元素
2.  裁剪区域是可以伸缩的，和移动同理，都是点击某个区域然后移动，只是这里的具体操作不是改变位置，而是改变大小。
    【1，2 点值得注意的是`transform：translate（）`，如果使用这个元素，它的位置具有了两个偏移值，最终获取的`left`和`top`就不是当前位置的最终`left`和`top`，因为忽视了`transform`带来的影响】
3.  还有一些细节处理，比如裁剪区域不应该大于（超出）图片工作台，这会导致最终的`left`，`top`，`width`，`height`出错
4.  导出图片

### 图片马赛克

核心是`canvas`API 的 ImageData 对象及其对应的 API，ImageData 代表了 `canvas` 绘制的图形的一个像素信息 R/G/B/A。
像素其实是一个四方形的色块，图片是由不同像素（色块）组成的，在一定大小下，像素越多代表的色块越多数据越多图片也越清晰；像素少那么数据少，图片只有寥寥几个色块组成，色块就会大，因为大，色块的角就会明显，图形也会因此出现一些“锯齿”（可以由此理解抗锯齿），失真。马赛克可以是失真，马赛克就是区域内的色块信息少，图形模糊。
实现思路：

1. 由 `canvas.getImageData(left,top,width,height)`,可以获取 `canvas` 内指定位置指定大小的区域像素信息。
2. 马赛克即失真，即色块大而少，思路就是：图片原来是 css 的 1px 对应一个色块的，那么要求失真，就可设置为 css 的 4px 对应一个色块【同一种颜色的原本的四个小色块（随机选取原来四个色块中的一种即可）】。
3. 具体实现就是修改 ImageData 对应的值。`ImageData.data[(4 * (y * w + x)) + color]`，取值赋值即可，y 代表图片原本的第 y 行，x 代表图片原本的第 x 列，color 的值域由 0/1/2/3 分别代表取 R/G/B/A 中的值

    ```js
    // 取得x列y行像素的RGBA值的数组
    function getXY(imgData, x, y) {
        const w = imgData.width
        let color = []
        color[0] = imgData.data[4 * (y * w + x)]
        color[1] = imgData.data[4 * (y * w + x) + 1]
        color[2] = imgData.data[4 * (y * w + x) + 2]
        color[3] = imgData.data[4 * (y * w + x) + 3]
        return color
    }

    // 设置像素
    function setXY(imgData, x, y, color) {
        const w = imgData.width
        imgData.data[4 * (y * w + x)] = color[0]
        imgData.data[4 * (y * w + x) + 1] = color[1]
        imgData.data[4 * (y * w + x) + 2] = color[2]
        imgData.data[4 * (y * w + x) + 3] = color[3]
    }
    ```

## 随记

-   `let img = new Image()`创建的图片，不能直接获取 naturalWidth/Height，因为加载图片还没完成（异步），所以至少要在`img.onload` 回调里面获取
-   `const style = window.getComputedStyle(el)`和`el.style.width`，前者是计算后的 el 标签的样式，后者只是获取 el 标签的内联样式；同时两者的都是一个字符串，[numeber]px，所以取值或复制时要注意。。。不然隐式转换就。。。
-
