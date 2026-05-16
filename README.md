# CDJava_web_handmade

## Yêu cầu

- **Node.js:** phiên bản LTS
- **npm / yarn:** npm >= 9 hoặc yarn
- **Java:** OpenJDK 17 (cho Spring Boot)
- **Maven:** >= 3.8
- **MySQL / MariaDB:** >= 8 

## Cài đặt môi trường (tạo môi trường & phiên bản)

- Cài Node.js: tải từ https://nodejs.org và sử dụng phiên bản LTS.
- Cài Java: cài OpenJDK 17 và thiết lập `JAVA_HOME`.
- Cài Maven: cài Maven và đảm bảo `mvn` chạy được từ terminal.
- Cài MySQL và tạo một database mới (ví dụ `handmade_db`).

Gợi ý tạo môi trường local bằng nvm (Node) và sdkman (Java):

```bash
# Node (nvm)
nvm install 18
nvm use 18

# Java (sdkman)
/sdkman install java 17-open
```

## Cấu hình biến môi trường

- Backend NodeJS: tạo file `.env` trong `backend-nodejs` với tối thiểu:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=handmade_db
JWT_SECRET=your_jwt_secret
PORT=5000
```

- Backend Spring Boot: cập nhật `src/main/resources/application.properties` trong `backend-springboot` với thông tin kết nối DB và cổng (hoặc dùng profile riêng).

- Frontend (React): trong `frontend` tạo file `.env` (hoặc `.env.development`) ví dụ:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Cách chạy (phát triển)

- Bật database (MySQL) và tạo database/nhập schema trong thư mục `database/` (nếu có file SQL). Ví dụ:

```bash
# import SQL nếu có
mysql -u root -p handmade_db < database/schema.sql
```

- Backend Node.js

```bash
cd backend-nodejs
npm install
# phát triển
npm run dev
# hoặc production
npm start
```

- Backend Spring Boot

```bash
cd backend-springboot
mvn clean install
mvn spring-boot:run
```

- Frontend (React)

```bash
cd frontend
npm install
npm start
```

## Lưu ý

- Điều chỉnh các tên biến môi trường theo mã nguồn của bạn nếu khác.
- Nếu muốn chạy toàn bộ bằng Docker, có thể thêm `docker-compose` sau khi tạo các file cấu hình tương ứng.

Nếu bạn muốn, tôi có thể thêm file `.env.example` cho từng phần (backend-nodejs, frontend) và mẫu `docker-compose.yml` để khởi động nhanh mọi thứ.