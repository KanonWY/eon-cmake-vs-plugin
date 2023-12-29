###  创建一个可执行的 test target
```cmake
eon_add_executable_test( test_name
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
###  使用说明
本测试目标可与已有的库目标同名，若存在同名库目标，则会自动依赖它，测试目标无法被导出，也无法设置别名，仅用于开发人员调试。
EON_DONT_COMPILER_TEST: 全局变量，开启后test不编译。

---
###  参数解释
| 参数     | 解释 | 
|---------|------|
|CASE| 指定测试目标样例名称|
|DEPENDS| 本目标依赖的工程内其他库目标，将自动导入头文件目录、库文件|
|FORCE_DEPENDS| 形如 DEPENDS 参数，但会告知链接器将其强制链接|
|SOURCES|为本目标导入额外源文件|
|SOURCE_DIRECTORIES| 为本目标设置的源文件目录；本函数默认设置的源文件目录为调用本函数的 cmake 文件夹所在目录下的 src/${name} 目录|
|INCLUDES|为本目标导入头文件目录|
|LIBRARIES|为本目标导入链接库|
| EON_DONT_COMPILER_TEST| 全局变量，开启后test不编译|
---
### - example:
```cmake
eon_add_executable_test(libA)
```