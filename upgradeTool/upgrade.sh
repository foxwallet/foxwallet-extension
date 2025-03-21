#!/bin/bash
# 定义文件夹路径
DIST_DIR="./dist"
DIST_OLD_DIR="./dist_old"
DIST_NEW_DIR="./dist_new"
EXTENSION_DIST_DIR="$HOME/dev/extension/dist"

# 创建文件夹（如果不存在）
create_folders() {
  for folder in "$DIST_DIR" "$DIST_OLD_DIR" "$DIST_NEW_DIR"; do
    if [ ! -d "$folder" ]; then
      mkdir -p "$folder"
      echo "创建文件夹: $folder"
    fi
  done
}

# 显示菜单
show_menu() {
  echo "-------------------------------------------"
  echo "请选择:"
  echo "1   清空dist"
  echo "2   清空dist，并将dist_old内容复制到dist"
  echo "3   将dist_new内容覆盖更新到dist"
  echo "4   清空dist_new，并将工程编译的dist内容复制到dist_new"
  echo "5   退出脚本"
  echo "-------------------------------------------"
}

# 清理文件夹
clean_folder() {
  local folder="$1"
  if [ -d "$folder" ]; then
    rm -rf "$folder"/*
    echo "$folder 文件夹已清空。"
  else
    echo "$folder 文件夹不存在，无需清理。"
  fi
}

# 复制文件夹内容
copy_folder() {
  local src="$1"
  local dest="$2"
  if [ -d "$src" ] && [ "$(ls -A "$src" 2>/dev/null)" ]; then
    cp -rf "$src"/* "$dest"
    echo "$src 文件夹内容已复制到 $dest。"
  else
    echo "$src 文件夹不存在或为空，请检查路径。"
  fi
}

# 在脚本启动时创建必要的文件夹
create_folders

# 主逻辑
while true; do
  show_menu
  read -p "请输入选项（1-5）：" choice
  case $choice in
    1)
      clean_folder "$DIST_DIR"
      ;;
    2)
      clean_folder "$DIST_DIR"
      copy_folder "$DIST_OLD_DIR" "$DIST_DIR"
      ;;
    3)
      copy_folder "$DIST_NEW_DIR" "$DIST_DIR"
      ;;
    4)
      clean_folder "$DIST_NEW_DIR"
      copy_folder "$EXTENSION_DIST_DIR" "$DIST_NEW_DIR"
      ;;
    5)
      echo "退出脚本。"
      exit 0
      ;;
    *)
      echo "无效选项，请输入1-5之间的数字。"
      ;;
  esac
  echo ""
done