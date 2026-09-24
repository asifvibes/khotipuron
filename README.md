# ক্ষতিপূরণ / Khotipuron

A phone game. You walk, or you sit under a tree. Then that ordinary moment stops. The screen says what a family may get as ক্ষতিপূরণ, because one real news article discussed that amount for a person who died in the same kind of incident.

The amount is the figure in the article, and the kind of figure it was. It is not a score. If the article does not mention a compensation amount, the screen says so and does not print a number. The public site name is [khotipuron.com](https://khotipuron.com). This repo does not deploy it.

The screen is Bangla until you switch it. English replaces Bangla. It does not sit underneath. The same top bar switches to a light screen. Both choices stay on this phone.

A case you have already seen stays on this phone (`localStorage`). The draw plays every collected case. Stories that state a taka amount come first, then the rest. A seen case does not return until that pool is finished. When the draw is finished, the screen says so in the language you chose. It does not start the list over.

From the report you can share the result. The link opens that same case, then offers a way to play and draw a different one. The preview uses the public origin `https://khotipuron.com`.

## Run

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:47291](http://127.0.0.1:47291). The method page is `/method`. A shared result is `/c/<id>`, for example `/c/firoza-begum-shibganj`.

`npm run check-cases` checks that every row is internally consistent, that a finished play does not draw a seen case again, and that a case with no discussed amount does not print a digit.
