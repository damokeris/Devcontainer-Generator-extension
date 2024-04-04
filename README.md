# 介绍

- 这个插件能够做什么？

你可以使用 `ctrl` + `shift` + `P` 调出命令菜单，然后输入 `Create Devcontainer` 来创建 devcontainer

# 需求

// TODO 将README中的需求写入更改日志的未发布中

- [x] 根据需求生成 devcontainer.json 和 Dockerfile
      使用 Dockerfile 构架开发容器是为了让环境和依赖可回溯，方便二次开发。
- [x] 判断用户是否已经有 devcontainer 文件夹和内容，以及是否要覆盖
- [x] 提供更多的服务可选，例如 node 环境，sql 数据库等，并能够根据复选框，在 Dockerfile 中安装。
- [x] 将生成文件的逻辑放到最后，防止用户在中途推出时，仍然生成.devcontainer。
- [x] 为默认的 root 用户创建密码为 123456

- [x] 优化生成的 Dockerfile 逻辑和内容，目前存在无法正确进入开发容器的情况
      可能是网络原因
- [x] 为用户提供选项是否要替换源为中国镜像源
- [x] 初始化的环境安装 git
- [x] 提供 node 环境选项

- [ ] 重新调整 MySQL 安装时的启动命令，CMD 似乎不起作用。
- [ ] 对于有状态的服务，例如 MySQL 应当生成 shell 脚本，用 CMD 命令批量启动
- [ ] node 版本目前不可控，默认安装最新版
- [ ] 对于 git 配置，最好能够读取用户本地的 git 配置，并直接为开发容器设置好 git 全局属性，例如 username 和 email
