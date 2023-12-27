### - 在本工程下，创建一个可执行目标
```cmake
eon_add_executable(name
   [DEPENDS               [<depend-name> ...]           ]

   [FORCE_DEPENDS         [<depend-name> ...]           ]

   [SOURCES               [<file>      ...  ]           ]
   [SOURCE_DIRECTORIES    [<directory> ...  ]           ]
   [INCLUDES              [<directory> ...  ]           ]
   [LIBRARIES             [<library>   ...  ]           ]

   [NAMED                 <alias>                       ]
   [HIDDEN]
)
```
---
### - 参数解释
| 参数     | 解释 | 
|---------|------|
| DEPENDS | 本目标依赖的工程内其他库目标，将自动导入头文件目录、库文件。| 
| FORCE_DEPENDS | 形如 DEPENDS 参数，但会告知链接器将其强制链接。| 
| SOURCES     | 为本目标导入额外源文件  | 
| SOURCE_DIRECTORIES | 为本目标设置的源文件目录,本函数默认设置的源文件目录为调用本函数的 cmake 文件夹所在目录下的srcname 目录。|
| INCLUDES | 为本目标导入头文件目录 |
| LIBRARIES | 为本目标导入链接库|
| NAMED | 库的别名；默认为 ${PROJECT_NAME}_name|
|HIDDEN|标识该库不导出；默认通过 install 目标导出|
---
### - example
```cmake
eon_add_executable(${tool_name}
   DEPENDS
      eon-interface
   LIBRARIES
      XXX_LIB
   INCLUDES ${CMAKE_CURRENT_SOURCE_DIR}/include
)
```