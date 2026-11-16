# Chamado Aberto: site + API com banco SQLite, sem dependências externas.
FROM node:24-alpine
WORKDIR /app
COPY . .
ENV PORT=8080 DB_PATH=/dados/chamados.db
EXPOSE 8080
CMD ["node", "server/server.js"]
