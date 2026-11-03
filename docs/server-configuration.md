> Tài liệu cấu hình máy chủ

Máy chủ được cấu hình với một file `toml` duy nhất.

# Bảng cấu hình `server`

Các cài đặt quan trọng như cổng nghe được cấu hình ở đây

```toml
[server]
listen_address = "0.0.0.0"
```

# Bảng cấu hình `database`

Các cài đặt về cơ sở dữ liệu được cấu hình ở đây

```toml
[database]
path = "đường/dẫn/đến/cơ-sở-dữ-liệu.db3"
```

# Bảng cấu hình `users`

Các cấu hình liên quan đến người dùng mặc định được đặt ở đây.

```toml
[users]
admin = "hashed_password"
# ^      ^
# |      |
# |      Mật khẩu sau khi băm với SHA-256
# Tên người dùng
```

Các người dùng được thêm bằng cách này sẽ có trường `salt` được đặt thành xâu rỗng nên có thể không được bảo mật bằng các người dùng được thêm bằng cách truyền thống.
