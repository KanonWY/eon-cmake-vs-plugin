###  查找指定多个第三库，并将头文件目录、库文件路径添加到对应或指定变量中。
```cmake
eon_find_packages( [<name> ...]
   [AS <result>]
   [COMPONENTS [<name> <name-component> ...]]
)
```
---
###  参数解释

| 参数     | 解释 | 
|---------|------|
| name | 需要查找的库名称 |
|AS |将找到的所有头文件目录、库文件路径，记录到 result_INCLUDE_DIRS、result_INCLUDE_DIR、result_LIBRARIES、result_LIBRARY 变量中|
|COMPONENTS|各个待导入的第三方库的组件，使用各个第三方库的名称进行分组|
---
###  example:
```cmake
eon_find_packages(
   eigen3 Boost
   COMPONENTS
       Boost system thread
   AS result
 )
message(${Boost_INCLUDE_DIRS} ${result_LIBRARIES})
```