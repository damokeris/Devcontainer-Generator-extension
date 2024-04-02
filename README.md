# 需求

- [x] 根据需求生成 devcontainer.json 和 Dockerfile
      使用 Dockerfile 构架开发容器是为了让环境和依赖可回溯，方便二次开发。
- [x] 判断用户是否已经有 devcontainer 文件夹和内容，以及是否要覆盖
- [x] 提供更多的服务可选，例如 node 环境，sql 数据库等，并能够根据复选框，在 Dockerfile 中安装。
- [x] 将生成文件的逻辑放到最后，防止用户在中途推出时，仍然生成.devcontainer。

- [ ] 优化生成的Dockerfile逻辑和内容，目前存在无法正确进入开发容器的情况
