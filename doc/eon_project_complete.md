###  配合工具箱实现 eon 工程的收尾工作，并设置一些导出选项。
```cmake
eon_project_complete(
   [DEFAULT_EXPORTS_ALL]
   [ALWAYS_EXPORTS        [<component>           ...] ]
   [DEFAULT_EXPORTS       [<component>           ...] ]
   [EXPORTED_MODULE_PATHS [<relative cmake path> ...] ]
)
```
###  参数解释
| 参数     | 解释 | 
|---------|------|
|DEFAULT_EXPORTS_ALL| 本工程被其他工程导入时，若用户没有指定组件，则默认导入全部组件|
|ALWAYS_EXPORTS| 设置总是导出的组件|
|DEFAULT_EXPORTS| 默认导出的组件|
|EXPORTED_MODULE_PATHS| 工程内的第三方库的 cmake 配置文件目录，应相对于安装目录，将一同记录在本目标的配置文件中。|
