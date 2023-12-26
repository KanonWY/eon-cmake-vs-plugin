#### 编译 protobuf 文件并创建为库目标，生成的 include 目录与 protobuf 文件的目录保持一致。
------------------------
```cmake
eon_add_protobuf(name
   [SOURCE_DIRECTORIES <protobuf files' directory> ...]
   [DEPENDS            <other protobuf target>     ...]
   [SHARED]
   [HIDDEN]
)
```
#### 描述
本函数不会立即编译 protobuf 文件，并创建对应的库目标。全部的 protobuf 的生成将在 eon_project_complete() 函数中完成。

#### 参数解释
| 参数     | 解释 | 
|---------|------|
| name |该 protobuf 目标的名称 |
| SOURCE_DIRECTORIES | protobuf 文件所在目录；若无指定，默认在调用本函数的 cmake 文件所在目录的 proto/${name} 目录下。|
| DEPENDS |本目标依赖的其他工程 protobuf 目标|
| SHARED |将 protobuf 目标编译为动态库 |
| HIDDEN | 标识该库不导出；默认通过 install 目标导出 |