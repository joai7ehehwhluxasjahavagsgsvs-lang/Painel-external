FROM node:18-alpine

WORKDIR /app

# Copia todo o painel para dentro do container
COPY cheat-panel /app/cheat-panel

# Instala dependências apenas do backend (produção)
WORKDIR /app/cheat-panel/backend
RUN npm install --production

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
