### - 在本工程下，创建一个库目标
```cmake
eon_add_library(name
   [DEPENDS               [<depend-name> ...]           ]

   [FORCE_DEPENDS         [<depend-name> ...]           ]
   [SOURCES               [<file>      ...  ]           ]
   [SOURCE_DIRECTORIES    [<directory> ...  ]           ]
   [INCLUDES              [<directory> ...  ]           ]
   [LIBRARIES             [<library>   ...  ]           ]

   [NAMED                 <alias>                       ]
   [SHARED]
   [HIDDEN]
)
```
---
### - 参数描述
| 参数     | 解释 | 
|---------|------|
| name |该 protobuf 目标的名称 |
| DEPENDS | 本目标依赖的工程内其他库目标，将自动导入头文件目录、库文件|
| FORCE_DEPENDS | 形如 DEPENDS 参数，但会告知链接器将其强制链接 |
|SOURCES |为本目标导入额外源文件|
| SOURCE_DIRECTORIES| 为本目标设置的源文件目录, 本函数默认设置的源文件目录为调用本函数的 cmake 文件夹所在目录下的 src/${name} 目录|
| INCLUDES|为本目标导入头文件目录 |
| LIBRARIES|为本目标导入链接库 |
| NAMED|库的别名；默认为 ${PROJECT_NAME}_name|
| SHARED | 标识该库编译为动态库 |
| HIDDEN | 标识该库不导出；默认通过 install 目标导出 |
---
### - example
```cmake
eon_add_library(test
   DEPENDS
      eon-interface
   LIBRARIES 
      yaml
)
```