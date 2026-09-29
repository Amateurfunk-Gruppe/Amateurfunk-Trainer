# Die Bruecke zwischen App und Node.js (29.09.2026).
cmake_minimum_required(VERSION 3.10.2)
project(trainer)

add_library(trainer-native SHARED src/main/cpp/native-lib.cpp)
include_directories(libnode/include/node/)

add_library(libnode SHARED IMPORTED)
set_target_properties(libnode PROPERTIES IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/libnode/bin/${ANDROID_ABI}/libnode.so)

find_library(log-lib log)
target_link_libraries(trainer-native libnode ${log-lib})
