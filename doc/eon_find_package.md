#### 采用多种方式，查找指定的一个第三方库，并将头文件目录、库文件路径添加到对应变量中
```cmake
eon_find_package(name
   [COMPONENTS <component> ...]
) 
```
#### 参数解释

| 参数     | 解释 | 
|---------|------|
| name | 需要查找的库名称 |
| COMPONENTS | 指定第三方库的组件 |