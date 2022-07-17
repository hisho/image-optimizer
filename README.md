# image-optimizer

sharpを使って画像圧縮するcli


## Install

```shell
$ npm i -D @hisho/image-optimizer
# or
$ yarn add -D @hisho/image-optimizer
```

## Feature

1. `src/iamges/**/*\.(png|jpg)`を`public/images/**/*\.(png|jpg)`に圧縮しコピーする
2. `src/iamges/**/*\.(png|jpg)`を`public/images/**/*\.(png|jpg).webp`に変換し出力する
3. `src/iamges/**/*\.(png|jpg)`を`[640, 828, 1080, 1200, 1920]`の大きさにリサイズする
4. `src/lib/images.ts`画像の`pathをマッピングしたファイル`を出力する
5. `-w`または`--watch`をつけるとファイルを監視する

## Usage
package.jsonのscriptsに以下を追加する

```json
{
  "scripts": {
    "watch:image": "./node_modules/@hisho/image-optimizer/bin/index.js --watch", 
    "build:image": "./node_modules/@hisho/image-optimizer/bin/index.js"
  }
}
```

## TODO
- オプションを受け取れるようにする
- マッピングファイルの出力の有無を指定できるようにする
- 画像の圧縮率を変更できるようにする
- 画像のリサイズを変更できるようにする
- 出力と入力を自由に設定できるようにする
- `scripts`の指定の方法を`@hisho/image-optimizer --watch`でできるようにする