###  添加指定目录下的所有子目录（非递归），将自动跳过不包含 CMakeLists.txt 的目录。
```cmake
eon_add_subdirectories( [<dir> ...] )
```
###  example:
```cmake
eon_add_subdirectories(base)
```