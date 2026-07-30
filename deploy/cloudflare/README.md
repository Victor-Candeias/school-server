# Cloudflare Tunnel para schoolhome.pt

O ponto de entrada público da aplicação é o Nginx local em
`http://localhost:80`. O túnel é gerido pelo dashboard da Cloudflare; o token
não deve ser guardado neste repositório.

## Criar e instalar o túnel

1. No dashboard da Cloudflare, abrir `Networking > Tunnels`.
2. Criar um túnel `schoolhome-server`.
3. Escolher Linux e copiar o token apresentado.
4. Na raiz deste projeto, executar:

   ```bash
   sudo ./deploy/enable-schoolhome.sh
   ```

   O script pede o token sem o guardar no repositório, instala o serviço,
   aplica a configuração Nginx e reinicia as APIs.

5. Adicionar uma rota `Published application`:

   | Campo | Valor |
   |-------|-------|
   | Hostname | `schoolhome.pt` |
   | Service | `HTTP` |
   | URL | `http://localhost:80` |

6. Adicionar `www.schoolhome.pt` ao mesmo serviço ou redirecioná-lo para o
   domínio principal através da Cloudflare.
7. Em `SSL/TLS > Edge Certificates`, manter Universal SSL ativo e ativar
   `Always Use HTTPS`.

## Validar

```bash
systemctl status cloudflared --no-pager
curl -I https://schoolhome.pt/
curl -I https://schoolhome.pt/auth-api/openapi.json
curl -I https://schoolhome.pt/school-api/openapi.json
curl -I https://schoolhome.pt/db-api/openapi.json
```

Os três primeiros pedidos devem responder. `/db-api` deve devolver 404, pois
essa API é exclusivamente interna e continua acessível aos restantes serviços
em `http://127.0.0.1:8000/db-api`.
