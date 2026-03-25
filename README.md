# Hang Zhao Portfolio — 部署指南

## 架构概览

- **平台**: Fly.io (IAD - Virginia)
- **域名**: hangzhao.design
- **代码部署**: GitHub push → GitHub Actions 自动部署
- **媒体文件**: Fly persistent volume (`public/uploads/`)
- **数据库**: SQLite，存在 volume 里 (`public/uploads/portfolio.sqlite`)

---

## 日常操作

### 1. 改代码（PHP / CSS / JS / HTML）

直接在 GitHub 上改或本地改完 push：

```bash
git add .
git commit -m "your message"
git push
```

GitHub Actions 会自动部署，通常 1-2 分钟。

### 2. 上传图片（单张或少量）

```bash
fly sftp shell -a hangzhao-fragrant-grass-802
> put /本地路径/image.jpg /opt/render/project/src/public/uploads/image.jpg
```

传完立刻生效，不需要 deploy。

### 3. 批量上传图片

```bash
# 方法一：逐个 put
fly sftp shell -a hangzhao-fragrant-grass-802
> put img1.jpg /opt/render/project/src/public/uploads/img1.jpg
> put img2.jpg /opt/render/project/src/public/uploads/img2.jpg

# 方法二：SSH 进容器用 tar（适合大量文件）
# 先在本地把图片打包
tar czf images.tar.gz -C /本地图片目录 .

# 传包上去
fly sftp shell -a hangzhao-fragrant-grass-802
> put images.tar.gz /opt/render/project/src/public/uploads/images.tar.gz

# SSH 进去解压
fly ssh console -a hangzhao-fragrant-grass-802
cd /opt/render/project/src/public/uploads
tar xzf images.tar.gz
rm images.tar.gz
```

### 4. 修改数据库

```bash
# SSH 进容器
fly ssh console -a hangzhao-fragrant-grass-802

# 直接操作 SQLite
sqlite3 /opt/render/project/src/public/uploads/portfolio.sqlite

# 例如：查看所有项目
SELECT id, title, image_url FROM projects;

# 例如：更新某项目封面
UPDATE projects SET image_url='/uploads/new-cover.jpg' WHERE id=22;
```

或者通过网站 admin 后台操作：`hangzhao.design/admin.php`

---

## 常用 Fly 命令

```bash
fly status                    # 查看运行状态
fly logs                      # 实时日志
fly ssh console               # SSH 进容器
fly sftp shell                # SFTP 传文件
fly deploy                    # 手动部署（一般不需要）
fly machine start             # 手动启动机器（如果停了）
```

---

## 注意事项

- **`.dockerignore` 已忽略 `public/uploads/`**，所以 git 里的图片不会被部署。所有图片通过 sftp 或 admin 后台管理。
- **数据库在 volume 里**，deploy 不会覆盖。
- **`min_machines_running = 1`**，机器保持常开，无冷启动延迟。
- 连续多次 push 不会冲突（deploy.yml 已配置 concurrency）。

---

## 故障排查

```bash
# 网站打不开？先看状态
fly status

# 机器停了？启动它
fly machine start

# 看日志找报错
fly logs

# 数据库问题？SSH 进去检查
fly ssh console
sqlite3 /opt/render/project/src/public/uploads/portfolio.sqlite "SELECT count(*) FROM projects;"
```


## 备份数据库到 GitHub

在 admin 后台改完内容后，本地终端跑：

```bash
./backup.sh
```

会自动从 Fly 下载最新数据库并提交到 GitHub。首次使用需要先赋权：

```bash
chmod +x backup.sh
```