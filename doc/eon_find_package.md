### - 采用多种方式，查找指定的一个第三方库，并将头文件目录、库文件路径添加到对应变量中
```cmake
eon_find_package(name
   [COMPONENTS <component> ...]
) 
```
---
### - 参数解释

| 参数     | 解释 | 
|---------|------|
| name | 需要查找的库名称 |
| COMPONENTS | 指定第三方库的组件 |
---
### - example:
```cmake
# 查找 eCAL 组件
eon_find_package(eCAL)
# 查找 ROS 组件
eon_find_package(catkin COMPONENTS
    roscpp
    rospy
    geometry_msgs
    grid_map_ros
    grid_map_msgs
    message_runtime
    std_msgs
    sensor_msgs
    cv_bridge
)
```