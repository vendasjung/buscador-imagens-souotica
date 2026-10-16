# SouÓtica — Buscador de Imagens

Aplicativo React + Vite para importar planilhas SavWin, localizar fotografias de produtos na **Brave Image Search API**, classificar as candidatas e exportar imagens aprovadas. **Não integra com a Tray nesta etapa.**

## Rodar localmente

1. Instale Node 20+.
2. Execute `npm install` e `npm run dev`.
3. Copie `.env.example` para `.env.local`, preenchendo a URL e a chave **publicável** de um projeto Supabase dedicado.

## Preparar Supabase

1. Use um projeto Supabase **separado dos CRMs**.
2. Em Authentication, crie um usuário de teste por e-mail/senha.
3. Publique a Edge Function `brave-images` incluída no repositório, com verificação de JWT ativada.
4. Configure o segredo `BRAVE_API_KEY` nas configurações de Edge Functions do projeto. Nunca coloque o token Brave no frontend ou GitHub.
5. A função valida a sessão antes de enviar a pesquisa à Brave.

## Publicar o site

Pode hospedar a interface em um serviço para Vite/React como Vercel ou Netlify, configurando as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nesse serviço. O GitHub **não hospeda um backend protegido**.

## Notas importantes

- A correspondência é uma **sugestão**, não uma confirmação automática de cor/modelo.
- EANs devem ser conferidos com fabricantes ou distribuidores.
- Somente publique fotografias com autorização de uso comercial.
- O CSV exportado não altera dados da Tray.
- A versão inicial mantém produtos e aprovações apenas na sessão do navegador; persistência em banco ficará para a próxima etapa.
