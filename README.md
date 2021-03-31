# Web site base code
**必須**
```npm```

## インストール package.json
```npm install```
---

## Run dev
```npm run dev```
---

## Build
`npm run build`
---

## HTML操作
> _modules
*メインページはpages/*

## JS, SASS操作
> _src

### Include html into html
```
@@include('..layouts/header.html',{
    "title": "title",
    "level": "../"
})
```

### 渡された変数を使い方
*@@[変数]*
```
@@title
@@level
``` 

### ビルドされたものは ./distに入ります。


