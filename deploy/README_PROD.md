Deploy automático (VPS)

Se você quer um site permanente próprio para compartilhar com clientes, pode rodar o script `deploy/bootstrap.sh` em um servidor Ubuntu 22.04+ com acesso root.

Passo rápido — no servidor, execute (substitua DOMAIN, REPO e EMAIL):

```bash
sudo bash -c "$(curl -sSL https://raw.githubusercontent.com/youruser/yourrepo/main/deploy/bootstrap.sh)" yourdomain.com https://github.com/you/Painel-external.git you@youremail.com main
```

Obs:
- O script instala Docker, Docker Compose, Nginx e Certbot, clona o repositório, sobe o container e habilita HTTPS com Let's Encrypt.
- Você precisa apontar o DNS do `yourdomain.com` para o IP público do servidor antes de rodar o script (A record).
- Se preferir, execute manualmente os passos do `deploy/bootstrap.sh` em vez do one-liner.

Se quiser, posso gerar instruções específicas para o provedor que você escolher (DigitalOcean, Hetzner, AWS, etc.) e ajustar o script para usar Docker Registry ou CI/CD.
