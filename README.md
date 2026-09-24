# সাধারণ কাজ

A small phone game. You walk, or you sit under a tree. Then an ordinary moment stops. The screen shows one real death from a news article: the name when the article prints it, the age, what the person was doing, the amount the article discussed, what kind of amount that was, the year, and a link.

The amount is not a score. If the article discusses no sum, the screen says so and prints no taka figure.

Bangla is first. English is the other line. A button switches which one sits on top.

Cases already seen stay on this phone (`localStorage`). When the file is finished, the screen says so in Bangla and English. It does not start the list over.

## Run

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:47291](http://127.0.0.1:47291). The method page is `/method`.

`npm run check-cases` checks that every row is internally consistent and that a finished play does not draw a seen case again.
