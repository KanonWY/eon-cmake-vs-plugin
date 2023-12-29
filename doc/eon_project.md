###  本工程的初始化，需要设置名字与版本，支持自动化识别设置
```cmake
eon_project(
   [NAME         <project-name>   ]
   [VERSION      <project-version>]
   [VERSION_NAME <version-name>   ]

   [NAME_FROM_GIT]
   [VERSION_FROM_GIT]
   [VERSION_NAME_FROM_GIT]
   [GIT_ROOT <git-root>]

   [NAME_FROM_EON]
   [VERSION_FROM_EON]
   [EON_ROOT <eon-root>]
)
```
---
###  参数解释
| 参数     | 解释 | 
|---------|------|
|NAME | 工程名称；若无设置，需指定自动获取名称的方式|
|VERSION | 工程版本；若无设置，需指定自动获取版本的方式|
|VERSION_NAME|工程版本名称；若无设置，则使用 VERSION 参数的值来代替|
|NAME_FROM_GIT|自动从仓库信息中设置工程名字；如配置该参数，须同时配置 GIT_ROOT 参数|
|VERSION_FROM_GIT|自动从仓库信息中设置工程版本；如配置该参数，须同时配置 GIT_ROOT 参数|
|GIT_ROOT|配置 git 仓库所在的根目录|
|VERSION_NAME_FROM_GIT| 使用 git hash 来充当版本名称|
|NAME_FROM_EON| 自动从 .eon 中获取工程名称，须同时配置 EON_ROOT 参数|
|VERSION_FROM_EON|自动从 .eon 中获取工程版本，须同时配置 EON_ROOT 参数|
|EON_ROOT| 配置 .eon 所在的根目录|
## example：
```cmake
eon_project(
    EON_ROOT ${CMAKE_SOURCE_DIR}
    NAME_FROM_EON
    VERSION_FROM_EON
)
```