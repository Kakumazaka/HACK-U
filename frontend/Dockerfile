#イメージを指定
FROM node:20.17.0
#作業ディレクトリを設定
WORKDIR /main
#パッケージファイルをコピー
COPY package*.json ./
#依存関係をインストール
RUN npm install
# ソースコードをコピー
COPY . .
# アプリケーションをビルドして実行
RUN npm run build
CMD ["npm", "start"]
#コンテナのデフォルトポートを設定(アプリで使うポート)
EXPOSE 3000
