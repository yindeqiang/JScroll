JScroll
=======
这是一个用js实现的自定义滚动条
-----------------------------------

主要有以下的参数

- scrollWraper 要显示滚动条的元素ID
- isShowArrow 是否要显示两段的箭头 布尔值
- mode 显示模式 X： 只显示横向滚动条，Y: 只显示纵向滚动条 auto：根据内容自动显示
- YBarHeight 如果设置了这个参数，那么纵向滚动条的高度将固定，不再随着内容和容器高度比例变化而变化
- XBarWidth 如果设置这个参数，那么横向滚动条的高度将固定，不再随着内容和容器宽度比例变化而变化


-----------------------------------------

示例：

    <script>
    var options = {
            scrollWraper: "outer",
            isShowArrow: false,
            mode: "auto",
            YBarHeight: 50
    };
    var scroll = new JScrollBar(options);
    </script>
