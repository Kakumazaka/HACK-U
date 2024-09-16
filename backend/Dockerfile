#イメージを指定
FROM node:20.17.0
#作業ディレクトリを設定
WORKDIR /server
#パッケージファイルをコピー
COPY package*.json ./
#依存関係をインストール
RUN npm install

#アプリケーションのソースコードをコピー

#コンテナのデフォルトポートを設定(アプリで使うポート)
EXPOSE 5000
#アプリケーションを起動
CMD ["npm", "start"]
