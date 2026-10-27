# sadosboets

Site da viagem da La Casa De Seda para Cape Town, 10 a 24/03/2027.

## Arquitetura

- Netlify, projeto "sadosboets" (sadosboets.netlify.app), deploy pelo repo GitHub jacare180/sadosboets
- `public/index.html`: app inteiro em um arquivo (HTML/CSS/JS puro, sem framework). Rotas por hash: `#now`, `#plan`, `#ideas`, `#stays`, `#budget`
- `netlify/functions/api.mjs`: API com Netlify Blobs (store "trip", consistência strong)
  - `GET /api/state` | `POST /api/write {op: set|update|add, path, data}` | `POST /api/photo` | `GET /api/photo/:id`
  - Votos ficam em `votes/<id>/<nome>` e comentários em `comments/<id>/<cid>` (chaves separadas para evitar sobrescrita)
- O front faz polling a cada 8s com a aba visível
- Perfis por link de convite (`/?k=CODIGO`), sem login. O código fica no localStorage e sai da barra de endereço, então uma URL copiada é sempre a pública
  - `boets` (Ben, Guigo, Tho, Beny): tudo
  - `steen` (Raya, aparece como "Steen"): Now, Plan, Ideas, Our stay. Juggest e comenta
  - `locals` (amigos que moram lá): igual à Steen; digitam o nome uma vez, e num celular novo tocam no nome já usado
  - `public` (sem código): só Now e Plan com o que está decidido; casamento sem local e horário
- Códigos nas variáveis do Netlify `KEY_BOETS`, `KEY_STEEN`, `KEY_LOCALS` (nunca no repo, que é público). Trocar um código derruba o link antigo, mas só vale depois de um novo deploy
  - Gravar como variável comum, contexto "all": marcadas como secretas com contexto "all" elas não chegaram à função. A API registra no log, ao ligar, quais perfis têm código (`invite codes configured: ...`)
- A API (`roleOf`, `forRole`, `guestWrite`) filtra o que cada perfil recebe e pode gravar; a tela só reflete isso
- Steen e locais veem do Airbnb só o escolhido, com nome, bairro e fotos (sem link, preço ou endereço)
- O botão Share sempre compartilha o link público

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

## Deploy

- O repo é público: no plano grátis do Netlify, repo privado só aceita um contribuidor e o build falhava com "unrecognized Git contributor"
- Cada push na `main` dispara o build
- Dados no Blobs que precisam mudar sem acesso ao site são feitos por passos únicos no `api.mjs` (chaves `meta/...`), que só preenchem campos vazios

## Feito

- Ícone e modo app (manifest, apple-touch-icon, tags no `<head>`)
- Bachelors: USD 200 por pessoa (R3.320)
- Stays 1, 3 e 4 preenchidos a partir dos anúncios (27/10/2026), fotos em `public/stays/`. O Stay 4 não está disponível de 15 a 24/03

## Pendente

- Stay 2: o link é uma wishlist, falta o link do anúncio
- Melhorias de UX a partir dos prints do celular
- Onde dormimos de 10 a 11/03: TBC
- Etapa 2: "Steen approves / Steen disapproves" (selo separado dos votos), Steen coloca ideias no plano e tira só as dela
- Etapa 3: locais com parecer local (Must do, Skip it, Tourist trap) e "I'm in" nos programas
