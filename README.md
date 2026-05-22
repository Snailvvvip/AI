# 前置技术

- Docker：容器管理
- FastAPI：后段一步框架
- MySql：业务数据库
- Redis：缓存数据库
- Milvus：向量数据库
- Antd：前端UI框架
- AntDesignX：AI交互框架

# 1、购买服务器

- 镜像选择“宝塔Linux面板”，使用宝塔面板来做服务器运维相关的工作
- 点击服务器，进入服务器详情页面；点击“应用管理”，然后点击“密码登录”，然后点击“执行”按钮，然后他会显示宝塔面板登录的账号密码；然后点击访问连接右边的“访问”按钮；或通过FinalShell访问服务器，执行脚本获取宝塔面板账号密码。
- [下载FinalShell SSH工具](https://www.hostbuf.com/)
- 登录面板后，点击“一键激活专享特权”，选择需要安装的软件
- 安装docker：点开“Docker”菜单，点击立即安装，安装方式选择“默认”；通过Docker应用商店直接安装各种各样的软件。

## 安装软件

### docker
宝塔可视化安装
### mysql

- 使用Docker安装Mysql

```shell
docker run -d \
  --name mysql \
  -p 14148:3306 \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_ROOT_HOST=% \
  -v /www/app/mysql:/var/lib/mysql \
  mariadb:11.4.2
```

- 这里使用的端口为14148，需要在腾讯云服务器的“防火墙”面板中放开这个端口
- 进入到容器，准备创建数据库、导入数据库表以及表数据；执行如下命令进入容器实例：

```shell
docker exec -it mysql /bin/bash
```

### 安装 Postgres 数据库

使用Docker安装Postgres，安装 Postgres 16.3 这个版本，执行如下命令通过docker安装postgres：

```shell
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgresql \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=langgraph_db \
  -p 55443:5432 \
  -v /www/app/postgres/postgresql:/var/lib/postgresql \
  postgres:16.3
```

执行docker ps命令，可以看到新增的postgres容器实例
### 安装 Milvus 数据库

安装 Milvus 2.6.0 这个版本，前面安装mysql以及postgres分别将各自的数据放在了/www/app/mysql以及/www/app/postgres下，手动创建文件夹/www/app/milvus，执行如下命令：

```shell
mkdir -p /www/app/milvus
cd /www/app/milvus
wget https://github.com/milvus-io/milvus/releases/download/v2.6.0/milvus-standalone-docker-compose.yml -O docker-compose.yml
cp ./docker-compose.yml ./docker-compose-backup.yml # 备份文件，执行如下命令拷贝一份文件

```

然后是更改掉Milvus服务暴露的默认端口，主要是改掉milvus-standalone以及minio服务的默认端口：
```shell
# 原来
ports:
  - "19530:19530"
  - "9091:9091"
# 修改为如下所示：
ports:
  - "7323:19530"
  - "7324:9091"

# 同样的更改minio的端口如下：
ports:
  - "7325:9001"
  - "7326:9000"
```
7323,7324,7325,7326是milvus用到的端口，其中只有7323是需要暴露给外部的端口；

- 7323：milvus-standardalone服务对外端口；
- 7324：milvus的webui服务对外端口；
- 7325：minio的服务端口；
- 7326：minio的web服务端口；
然后是需要启用milvus的用户认证功能，默认情况下是没有开启的，也就是说一旦milvus的端口对外公开，任何人都可以通过端口的方式直接登录milvus，不需要认证，所以这里我们开启认证功能；我们需要在milvus容器配置中的environment中增加如下设置，启用账号密码认证功能：

```shell
COMMON_SECURITY_AUTHORIZATIONENABLED: true
```

完整文件

```shell
version: '3.5'

services:
  etcd:
    container_name: milvus-etcd
    image: quay.io/coreos/etcd:v3.5.18
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
      - ETCD_SNAPSHOT_COUNT=50000
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/etcd:/etcd
    command: etcd -advertise-client-urls=http://etcd:2379 -listen-client-urls http://0.0.0.0:2379 --data-dir /etcd
    healthcheck:
      test: ["CMD", "etcdctl", "endpoint", "health"]
      interval: 30s
      timeout: 20s
      retries: 3

  minio:
    container_name: milvus-minio
    image: minio/minio:RELEASE.2024-12-18T13-15-44Z
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    ports:
      - "7325:9001"
      - "7326:9000"
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/minio:/minio_data
    command: minio server /minio_data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  standalone:
    container_name: milvus-standalone
    image: milvusdb/milvus:v2.6.0
    command: ["milvus", "run", "standalone"]
    security_opt:
    - seccomp:unconfined
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
      MQ_TYPE: woodpecker
      # 启用 Milvus 认证
      COMMON_SECURITY_AUTHORIZATIONENABLED: true
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/milvus:/var/lib/milvus
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9091/healthz"]
      interval: 30s
      start_period: 90s
      timeout: 20s
      retries: 3
    ports:
      - "7323:19530"
      - "7324:9091"
    depends_on:
      - "etcd"
      - "minio"

networks:
  default:
    name: milvus
```
然后是执行如下命令，启动milvus容器实例：

```shell
docker-compose up -d
```
启动之后应该能看到milvus-standalone, milvus-etcd, milvus-minio三个服务；
安装完ATTU之后再配置腾讯云服务器放开端口；

### 安装ATTU





# 2、搭建本地后端环境

## Conda安装

```shell
conda env list # 查看环境列表
conda create -n workspaceName python=3.11 # 创建一个工作环境并指定这个工作环境使用Python3.11版本
conda activate workspaceName # 激活环境
pip config list # 看看当前pip的下载源镜像地址
# 如果global.index-url指向的是阿里源、清华源、淘宝源、腾讯源等国内源都没有问题，如果指向的是官方的pypl源则需要修改
pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/
```
## 在Pycharm中绑定项目与Conda环境

- 用Pycharm打开工程项目，打开设置，搜索"解释器(interpreter)"
- 点击Add Interpreter，然后是点击Add Local Interpreter（添加本地解释器），选择现有的conda，选择激活的conda环境

## 安装依赖

```shell
pip install poetry
pip install psycopg
poetry install # 安装项目依赖
```

## 启动服务配置

在运行配置中，需要确保工作目录（Working Directory）路径是工程根目录，也就是把末尾的/app去掉；

## mysql数据库

## postgres数据库

1、代码初始化数据库

