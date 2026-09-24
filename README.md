# ক্ষতিপূরণ / Khotipuron

A phone game. You walk, or you sit under a tree. Then that ordinary moment stops. The screen says what a family may get as ক্ষতিপূরণ, because one real news article discussed that amount for a person who died in the same kind of incident.

The amount is the figure in the article, and the kind of figure it was. It is not a score. If the article discusses no sum, the screen says no Khotipuron amount was discussed and does not print a number. The public site name is [khotipuron.com](https://khotipuron.com). This repo does not deploy it.

Bangla is first. English is the other line. A button switches which one sits on top. The wordmark stays ক্ষতিপূরণ, with Khotipuron under it.

A case you have already seen stays on this phone (`localStorage`). When the file is finished, the screen says so in Bangla and English. It does not start the list over.

From the report you can share the result. The link opens that same case, then offers a way to play and draw a different one. The preview uses the public origin `https://khotipuron.com`.

## Run

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:47291](http://127.0.0.1:47291). The method page is `/method`. A shared result is `/c/<id>`, for example `/c/firoza-begum-shibganj`.

`npm run check-cases` checks that every row is internally consistent, that a finished play does not draw a seen case again, and that a case with no discussed amount does not print a digit.
