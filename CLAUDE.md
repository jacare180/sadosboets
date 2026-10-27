# sadosboets

Site da viagem da La Casa De Seda para Cape Town, 10 a 24/03/2027.

## Arquitetura

- Netlify, projeto "sadosboets" (sadosboets.netlify.app), deploy pelo repo GitHub jacare180/sadosboets
- `public/index.html`: app inteiro em um arquivo (HTML/CSS/JS puro, sem framework). Rotas por hash: `#now`, `#plan`, `#ideas`, `#stays`, `#budget`
- `netlify/functions/api.mjs`: API com Netlify Blobs (store "trip", consistência strong)
  - `GET /api/state` | `POST /api/write {op: set|update|add, path, data}` | `POST /api/photo` | `GET /api/photo/:id`
  - Votos ficam em `votes/<id>/<nome>` e comentários em `comments/<id>/<cid>` (chaves separadas para evitar sobrescrita)
- O front faz polling a cada 8s com a aba visível
- Sem login: cada pessoa escolhe o nome (Ben, Guigo, Tho, Beny), salvo em localStorage

## Regras de conteúdo

- Site em inglês (um dos amigos é americano)
- Gírias do grupo: "Boet". O J no lugar da primeira letra só em VERBOS (Jike, Jadd, Jemove, Jote, Juggest, Jook it), nunca em substantivos
- Identidade: preto, branco e cinzas, acento laranja (`#f26a1b`) só para ação ou alerta. Fontes: Anton (display), Instrument Sans (texto), JetBrains Mono (números)
- Sem travessões nos textos
- Moedas: preços salvos em ZAR. 1 USD = R16,60 (Trading Economics, 26/10/2026); 1 USD = R$5,20 (taxa fixada pelo grupo)

## Datas fixas (travadas no roteiro)

- 12 a 14/03: Bachelors, festival fora da África do Sul (custo TBC)
- 15/03: volta, check-in Airbnb (15 a 24/03, 9 noites)
- Sex 19/03: Shabbat dinner, Luuma, dress smart
- Dom 21/03: Welcome Party, Norval Foundation, 17h, cocktail chic
- Ter 23/03: Casamento, Plaisir Wine Estate, Franschhoek, chuppah 16h, chegar 14h30, van, formal
- Meia maratona do Beny: dia a definir (o usuário escolhe pelo site)

## Pendente

- Ícone e modo app: pôr no repo os arquivos do sadosboets-public.zip (apple-touch-icon, manifest, ícones)
- Preencher os 4 Airbnbs (preço, quartos, amenidades, fotos). O link 2 é uma wishlist, não um anúncio
- Onde dormimos de 10 a 11/03: TBC
- Senha do grupo: não implementada (qualquer pessoa com o link edita)
