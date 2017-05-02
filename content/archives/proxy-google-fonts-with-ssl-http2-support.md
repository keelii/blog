+++
title = "Nginx 配置 Google fonts 反向代理开启 HTTP2/SSL 支持"
isCJKLanguage = true
date = "2017-04-22T11:19:58+08:00"
categories = ["Server", "Linux"]
tags = ["nginx"]
+++

由于博客主题使用了 Google fonts PT Serif 字体，国内只能通过中科大的代理来使用 Google fonts 字体。然而最近发现其速度不稳定，响应时间有时候甚至超过 600ms。刚好因为自己有 [vultr 的 VPS(带小尾巴)](http://www.vultr.com/?ref=6805146) 就自己动手搭了个来用

VPS 环境如下：

* Ubuntu 14.04
* Nginx 1.12.0 (最新版各别配置与之前不一样)
* Openssl 1.0.2j (新版 Nginx 开启 http2 需要的最低 openssl 版本)

## 重新编译安装 Nginx

如果之前编译安装没开启相关模块的话需要重新编译，大概参数如下：

```bash
./configure --prefix=/usr/local/nginx --with-http_ssl_module --with-openssl=/usr/local/ssl --with-http_v2_module --with-http_sub_module
```

编译完没有出错的话就 `make && make install` 就 OK 了

## 配置 Nginx 反代

### 基本配置

```nginx
upstream google {
    server fonts.googleapis.com:80;
}

upstream gstatic {
    server fonts.gstatic.com:80;
}
proxy_temp_path   /your/path/tmp 1 2;
proxy_cache_path  /your/path/cache levels=1:2 keys_zone=cache1:100m inactive=30d max_size=1g;
```

### 80 端口配置
```nginx
server {
    listen 80;
    server_name your.proxy.domain;
    root /your/path/;
    location /css {
        sub_filter 'fonts.gstatic.com' 'your.proxy.domain';
        sub_filter_once off;
        sub_filter_types text/css;
        proxy_pass_header Server;
        proxy_set_header Host fonts.googleapis.com;
        proxy_set_header Accept-Encoding '';
        proxy_redirect off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Scheme $scheme;
        proxy_pass http://google;
        proxy_cache cache1;
        proxy_cache_key $host$uri$is_args$args;
        proxy_cache_valid 200 304 10m;
        expires 365d;
    }
    location / {
        proxy_pass_header Server;
        proxy_set_header Host fonts.gstatic.com;
        proxy_redirect off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Scheme $scheme;
        proxy_pass http://gstatic;
        proxy_cache cache1;
        proxy_cache_key $host$uri$is_args$args;
        proxy_cache_valid 200 304 10m;
        expires 365d;
    }
}
```
### 443 端口配置

首先你得有个免费的 HTTPS 证书，这个可以参考我之前的文章：[免费 Https 证书（Let'S Encrypt）申请与配置](/2016/06/12/free-https-cert-lets-encrypt-apply-install/)

注意设置 `sub_filter` 字段的时候 **你的域名要加上 https://**，要不然会出现代理的 CSS 文件中的字体文件引用是 HTTP 而请求报 `blocked/mixed-content` 错

```nginx
server {
    listen 443 ssl http2;

    ssl on;
    ssl_certificate /etc/letsencrypt/live/your.proxy.domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your.proxy.domain/privkey.pem;
    ssl_dhparam /etc/ssl/certs/dhparams.pem;
    ssl_protocols SSLv3 TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers HIGH:!aNULL:!MD5;

    server_name  your.proxy.domain;
    root /var/sites/fonts/;

    location /css {
        sub_filter 'http://fonts.gstatic.com' 'https://your.proxy.domain';
        sub_filter_once off;
        sub_filter_types text/css;
        proxy_pass_header Server;
        proxy_set_header Host fonts.googleapis.com;
        proxy_set_header Accept-Encoding '';
        proxy_redirect off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Scheme $scheme;
        proxy_pass http://google;
        proxy_cache cache1;
        proxy_cache_key $host$uri$is_args$args;
        proxy_cache_valid 200 304 10m;
        expires 365d;
    }

    location / {
        proxy_pass_header Server;
        proxy_set_header Host fonts.gstatic.com;
        proxy_redirect off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Scheme $scheme;
        proxy_pass http://gstatic;
        proxy_cache cache1;
        proxy_cache_key $host$uri$is_args$args;
        proxy_cache_valid 200 304 10m;
        expires 365d;
    }
}
```

### 安全防盗链

如果不共享给其它人用的话还需要在配置中加入 referer 白名单判断，不符合条件的将返回 403

```nginx
valid_referers server_name *.your.domain.com *.other.domain.com;
if ($invalid_referer) {
    return 403;
}
```