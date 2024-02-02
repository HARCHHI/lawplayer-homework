# Lawplayer Homework

面試作業 - Post Image Uploading System

---

## 目錄

- 環境參數
- 開發環境
- 部署方式

## 環境參數

| env             | value                  |
| --------------- | ---------------------- |
| DB_FILE_PATH    | json db path           |
| REDIS_HOST      | redis host             |
| REDIS_PORT      | redis port             |
| IMGUR_API_URL   | https://api.imgur.com/ |
| IMGUR_CLIENT_ID | imgur clientid         |

## 開發環境

### 建立方式

```bash
npm install
```

### 測試方式

```bash
npm test # all unit tests
```

## 部署方式

所有相依服務、環境變數細節都可以參考docker-compose.example.yaml設定

```bash
cp docekr-compose.example.yaml docekr-compose.yaml

vim docekr-compose.yaml # edit all the envs into yours

docker compose up -d # docker-compose v2
```
