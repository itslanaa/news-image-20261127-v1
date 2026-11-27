[![news-image-20261127](https://make.fun/badge/news-image-20261127.svg)](https://make.fun/c/news-image-20261127)
[![rank](https://make.fun/badge/news-image-20261127/itslanaa/news-image-20261127-v1/rank.svg)](https://make.fun/c/news-image-20261127)
[![reward](https://make.fun/badge/news-image-20261127/itslanaa/news-image-20261127-v1/reward.svg)](https://make.fun/c/news-image-20261127)

# The World in One Day — Friday 27 November 2026

One image summing up the world's news of Friday 27 November 2026, built for the
[news-image-20261127](https://make.fun/c/news-image-20261127) competition on make.fun.

The front page leads with the day's biggest story — a drone strike in Kuwait
that killed two Italian technicians, which Italy and Kuwait blame on Iran and
Tehran denies — beside the first foreigner aboard China's Tiangong station and
a record Black Friday forecast. Thirty-seven stories in all, across nine
regions, each with its source and status (CONFIRMED / REPORTED / CLAIM /
FORECAST), a six-number stat band, a UTC timeline, and a date check that says
what was left out and why.

Every photograph is a real news photo from Wikimedia Commons, credited in its
caption; older photos are labelled FILE PHOTO with their year. Facts were
checked against Reuters, AP, CNN, BBC, the WSJ, Adobe, ONS, Nature, and
China's CMSA on 27 November 2026. Disputed counts are printed as ranges
(Gaza 8–9 killed; Cairo 21–26 injured).

## How it runs

`main.ts` (Node 22, standard library only) checks that `entry.png` is a whole,
well-formed PNG inside the competition's limits (at most 1 MiB, at most
1024×1024) and copies those exact bytes to `/output/entry.png`. It reads
nothing else and writes the same bytes on every run.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
