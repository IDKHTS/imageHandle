# imageHandle
题目2答案


## 打开
直接用浏览器打开index.html文件即可

 - `index.html`为图片压缩， [参考](https://segmentfault.com/a/1190000023486410)
 - `crop.hml`为图片裁剪demo，[参考](https://juejin.cn/post/6860024132730519560#heading-5)


## 思路

### 图片压缩
 核心是`canvas`API的`toBlob(cb, type, quality)`,第三参数就是0-1的一个压缩率。
 1. 取得本地图片，使用`input[type="file"]`，监听`onchange`，取`inputEl.files[0]`即可（只处理一张）
 2. 把本地图片放到`canvas`中，只要利用`canvas`API的`drawImage(imgEl,top,left,width,height)`,但是缺少对应图片的`Image标签`
 3. input取得的`File类的实例`要转为`Image标签`，主要可以利用`FileReader.readAsDataURL(file)`，传一个`File类实例`返回`base64数据`，然后把`base64数据`给到`Image.src`即可获取对应图片的`Image标签`
 4. 现在图片数据放到了canvas，调用`toBlob(cb, type, quality)`即可


 ### 图片裁剪
 	核心是`canvasAPI`的`resultCanvas.drawImage(imgEl | sourceCanvasEl,top,left,width,height)`，利用`top`,`left`,`width`,`height`四个参数可以在`参数sourceCanvasEl的图形`里面定义一个`矩形框`，框内的画在`resultCanvas`内。这样相当于把`sourceCanvas`的图形截取到了`resultCanvas`里面，只要把源图片画在`sourceCanvas`中，最终结果就是截取了图片。这里的难点就在于怎么获取四个参数`top`,`left`,`width`,`height`。
 四个参数`top`,`left`,`width`,`height`可以这样获取：定义一对父子元素，父元素背景使用`需要操作的图片`，并且父

​	元素和原图片是`等高等宽`或者`等比例`的和`背景图不重复（no-repeat）`。然后父元素还需要定义为相对定位`position: relative`，给子元素定位的。这样父元素其实就一张图，称为`图片工作台`。接下来就定义子元素，子元素应该是一个`比父元素小的`、`大小（宽高）可以伸缩的`，`半透明的`、`根据父元素相对定位`的区域，子元素就是用于作为裁剪的`裁剪区域`——选取父元素的区域。可以发现，`sourceCanvas`的宽高设置为父元素（图片工作台）的宽高，`resultCanvas`的宽高设置为子元素的宽高（裁剪区域），那么这对父子位置关系就是两个canvas的相对位置关系。即子元素（裁剪区域）css样式的`top`,`left`，是所求的两个参数`top`,`left`的值，子元素的宽高就是所求的`width`,`height`

 其余难点：
 1. 裁剪区域是可以移动的，也即需要实现一个元素随着鼠标的拖拽移动
    使用html5的拖拽？非也，因为拖拽主要还是一个元素里拖动到另外一个元素里（appendChild），没有记录具体的位置（left，top）。
    可以使用mousedown，mousemove，mouseup三个事件。当用户点击裁剪区域时，触发mousedown回调，回调里记录当前是拖动开始isMouseDown = true并且记录当前位置startX/Y（从参数event里面的e.pageX/Y获取)。当在裁剪区域移动时，触发mousemove回调，回调里判断如果isMouseDown = true，即在做拖动，获取当前位置和开始位置的偏移offsetX = e.pageX/Y - startX/Y，offsetX/Y即是移动的方向和距离，赋值给裁剪区域的css样式left和top即可实现拖动元素
 2. 裁剪区域是可以伸缩的，和移动同理，都是点击某个区域然后移动，只是这里的具体操作不是改变位置，而是改变大小。
    【1，2点值得注意的是transform：translate（），如果使用这个元素，它的位置具有了两个偏移值，最终获取的left和top就不是当前位置的最终left和top，因为忽视了transform带来的影响】
 3. 还有一些细节处理，比如裁剪区域不应该大于（超出）图片工作台，这会导致最终的left，top，width，height出错
 4. 导出图片
    


 ## 随记
 - `let img = new Image()`创建的图片，不能直接获取naturalWidth/Height，因为加载图片还没完成（异步），所以至少要在`img.onload` 回调里面获取
 - `const style = window.getComputedStyle(el)`和`el.style.width`，前者是计算后的el标签的样式，后者只是获取el标签的内联样式；同时两者的都是一个字符串，[numeber]px，所以取值或复制时要注意。。。不然隐式转换就。。。
 - 