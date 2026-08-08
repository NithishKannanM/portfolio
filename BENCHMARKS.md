# Numbers the posts still owe

Three published posts argue from experience and show no figures. Each one is
marked `evidence: reasoned` in its frontmatter, which renders as a pill on the
post and on the blog index — so the gap is stated on the site rather than
hidden. This file is the list of runs that closes it.

**The rule:** these numbers come from your own benchmark runs. Nothing here
gets estimated, interpolated, or filled in with a plausible-looking figure. A
post that shows invented numbers is worse than one that shows none, because
the first kind is a lie and the second kind is just incomplete.

## How to land a result

1. Run the benchmark, commit the script that produced it.
2. Drop a `<Results>` block into the post where the `STILL OWED` comment is.
3. Delete the `STILL OWED` comment.
4. Flip the frontmatter to `evidence: measured` and delete the reminder comment
   above it.

```mdx
<Results
  better="higher"
  columns={["Faithfulness", "Ctx. precision", "Cross-doc"]}
  rows={[
    { label: "BM25 only",  values: [0.71, 0.66, 0.42] },
    { label: "Dense only", values: [0.78, 0.61, 0.55] },
    { label: "RRF k=60",   values: [0.86, 0.74, 0.68], best: true },
  ]}
  caption="340 queries over the compliance corpus. Retrieval depth 50 per retriever."
  source="mmu/bench/eval.py @ 3f9a1c2 · 2026-08-14"
/>
```

`source` is required. It names the script and commit that produced the figures
so that a reader — or you, in a year — can re-run them. If you cannot name a
source, the number is not ready to publish.

---

## 1. RRF — do this one first

`content/blog/reciprocal-rank-fusion-in-practice.mdx` · marker at the
`STILL OWED` comment

This is the load-bearing gap. The post's thesis is that fusion earns its
complexity on a legal/compliance corpus, and it currently shows nothing. It is
also the post attached to `/lab/rrf-k`, which is the page most likely to be
linked from outside — so it is the one where a knowledgeable reader is most
likely to notice the hole.

- [ ] **RRF vs dense-only vs BM25-only**, all five custom metrics. Faithfulness
      and cross-document reasoning are the two the post names explicitly, so
      those two have to appear whatever else does.
- [ ] **Sweep over `k`** on your corpus. The lab page tells people to sweep
      rather than inherit 60 — the post should show what your own sweep found,
      including where your optimum landed and how far it is from 60.
- [ ] **Retrieval depth per retriever.** The post argues truncation artefacts
      look like ranking bugs. One table of fused quality against depth settles
      it.
- [ ] Query count and corpus size in the caption, so the numbers can be read
      for what they are.

## 2. PPO / Ring Zero

`content/blog/ppo-over-cgroup-v2-memory-tiers.mdx` · marker at the
`STILL OWED` comment

The project page already carries the headline result (90% warm rate against 86%
for App Standby Buckets at a 400 MB ceiling). What the post owes is the
training detail behind it.

- [ ] **Tuned reward weights** — the final values, and one line on what moved
      when you changed them.
- [ ] **Episode count** and wall-clock training time.
- [ ] **Ablation on the PSI penalty term.** This is the one that matters, and
      it is now doubly load-bearing: `/lab/psi-vs-free-bytes` argues PSI is the
      right observation and the ablation is the evidence. Free-bytes-only
      observation space vs PSI-included, same everything else.

## 3. Plateau

`content/blog/detecting-semantic-stagnation.mdx` · marker at the `STILL OWED`
comment

- [ ] **Precision / recall on the synthetic trajectory set**, against the
      repetition-detection baseline the post spends its first section
      dismantling. The post claims repetition detection fails in both
      directions — the table should show both directions.
- [ ] **Sensitivity sweep** for the trip point, showing how far it moves across
      runs. The post's argument is that the threshold has to be calibrated per
      run; the sweep is what makes that concrete.
- [ ] Size and construction of the synthetic set, in the caption.

---

## Instruments that would follow from these

Not owed, but worth knowing: two of the three lab candidates left are gated on
the same runs.

- An **embedding-drift visualiser** for Plateau needs the trajectory set above.
- Any **RRF results panel** in the lab needs the sweep from §1.

Getting the numbers unblocks more than the posts.
