import type { Scenario } from '~/types/scenario'

/**
 * Seeded into an empty `scenarios` table on startup (see db-migrate.ts) — the
 * content this project shipped with before scenarios moved from data/scenarios.ts
 * into the DB and became admin-editable. Only ever used to bootstrap a fresh DB;
 * once seeded, /admin is the source of truth and this file is never read again.
 */
export const scenarioSeed: Scenario[] = [
  {
    id: 'partner-gender-assumption',
    topic: 'lgbtq',
    situation: 'coworker',
    title: {
      ja: 'パートナーの話をしたら性別を決めつけられる',
      en: 'Her partner comes up — and gets assumed male'
    },
    summary: {
      ja: 'ランチ中、同僚のAoiさんが「週末パートナーと出かけた」と話すと、別の同僚が「彼氏と？」と決めつけて聞き返します。あなたも同じテーブルにいます。',
      en: 'Over lunch, your coworker Aoi mentions going out with their partner over the weekend. Another coworker asks, "With your boyfriend?" — assuming. You\'re at the same table.'
    },
    yourPosition: {
      ja: 'あなたはAoiさんのパートナーが同性であることを知っています。',
      en: "You know Aoi's partner is the same gender."
    },
    dialogue1: { ja: '彼氏と？どこ行ったの？', en: "With your boyfriend? Where'd you go?" },
    dialogue1Speaker: { ja: '同僚', en: 'A coworker' },
    dialogue3: { ja: '…あ、うん、まあ…', en: '...oh, um, yeah...' },
    dialogue3Speaker: { ja: 'Aoiさん', en: 'Aoi' },
    choices: [
      {
        id: 'say-nothing',
        text: { ja: '特に何も言わず、そのまま会話を続ける', en: 'Say nothing and let the conversation continue' },
        feedback: {
          ja: '気まずい空気を避けたい気持ち、よく分かります。ただこの場でAoiさんが感じたであろう小さな違和感は、周りが気づかなければそのまま流れてしまいます。一言でも後からフォローできると、Aoiさんの安心感につながります。',
          en: "It's understandable to want to avoid an awkward moment. But if nobody notices the small discomfort Aoi likely felt here, it just gets brushed past. Even a quick follow-up later can help Aoi feel supported."
        },
        isRecommended: false,
        strategy: 'none'
      },
      {
        id: 'redirect-topic',
        text: { ja: '「そういえば、この前のプロジェクトどうなった？」と話題を変える', en: '"Oh, how did that project turn out?" — change the subject' },
        feedback: {
          ja: '良い判断です。その場の空気を壊さずに話題を切り替えることで、Aoiさんが無理に訂正したり気まずい思いをする時間を減らせます。Distract（そらす）は、相手を守りながら場をコントロールする有効な手段です。',
          en: 'Good call. Shifting the topic without disrupting the mood spares Aoi from having to correct anyone or sit through an awkward moment. "Distract" is an effective way to protect someone while steering the room.'
        },
        isRecommended: true,
        strategy: 'distract'
      },
      {
        id: 'talk-after',
        text: { ja: 'ランチが終わった後、Aoiさんに「さっきの、大丈夫だった？」と個別に声をかける', en: 'After lunch, check in with Aoi privately: "Were you okay back there?"' },
        feedback: {
          ja: '良い判断です。その場で指摘しなくても、後から個別に気にかけることで「見ていたよ、味方だよ」というメッセージが伝わります。Delay（後で）は、その場の空気を優先しつつ本人をフォローしたいときに有効です。',
          en: 'Good call. Even without saying anything at the time, checking in privately afterward sends the message "I noticed, and I\'m on your side." "Delay" works well when you want to prioritize the room\'s mood while still following up.'
        },
        isRecommended: true,
        strategy: 'delay'
      },
      {
        id: 'direct-comment',
        text: { ja: '「彼氏って決めつけなくてもいいんじゃない？」とその場で伝える', en: '"You don\'t have to assume it\'s a boyfriend" — say it in the moment' },
        feedback: {
          ja: '勇気のある行動です。その場で直接指摘することで、同じような決めつけが繰り返されるのを防げる可能性があります。ただし相手の反応は様々なので、その後の会話にも注意を向けましょう。',
          en: 'A brave move. Speaking up in the moment can help prevent the same kind of assumption from repeating. Reactions vary though, so stay attentive to how the conversation goes afterward.'
        },
        isRecommended: true,
        strategy: 'direct',
        reactions: {
          defensive: {
            speakerName: { ja: '同僚', en: 'A coworker' },
            reactionText: {
              ja: 'え、そんなつもりじゃ…普通そう思うでしょ、そんなに怒ること？',
              en: "Whoa, I didn't mean anything by it — isn't that just normal to assume? Do you have to make a thing of it?"
            },
            explanation: {
              ja: '指摘された側が身構えて反発するパターンです。相手を責める意図がないことを伝えつつ、その場で長引かせず一旦区切ることも選択肢の一つです。',
              en: "This is a pattern where the person feels called out and gets defensive. Making clear you're not attacking them, while not dragging it out in the moment, is one way to handle it."
            }
          },
          confused: {
            speakerName: { ja: '同僚', en: 'A coworker' },
            reactionText: { ja: 'え、そうなの？知らなかった、ごめん…普通に聞いただけなんだけど', en: 'Wait, really? I had no idea, sorry — I was just asking' },
            explanation: {
              ja: '悪気なく決めつけていたことに気づいていないパターンです。責めるのではなく事実を伝えるだけで十分なことも多く、相手が自分で気づくきっかけになります。',
              en: "This is a pattern of an innocent assumption the person hadn't realized they were making. Simply stating the fact, without blame, is often enough — it gives them room to notice on their own."
            }
          },
          reflective: {
            speakerName: { ja: '同僚', en: 'A coworker' },
            reactionText: { ja: 'あ…そうだよね、ごめん、勝手に決めつけてた', en: "Oh... you're right, sorry, I just assumed" },
            explanation: {
              ja: '一番理想的な反応の一つです。指摘をきちんと受け止められる相手であれば、その場で関係を悪化させずに気づきを促せたことになります。',
              en: "One of the best-case reactions. When someone can take a correction in stride, you've shifted the moment without damaging the relationship."
            }
          }
        }
      }
    ]
  },
  {
    id: 'interview-wrong-pronouns',
    topic: 'lgbtq',
    situation: 'coworker',
    title: {
      ja: '面接で候補者に間違った代名詞を使い続ける面接官',
      en: '"He" — the interviewer keeps getting it wrong'
    },
    summary: {
      ja: '中途採用の面接中、面接官の一人が、非バイナリーであることを事前に伝えている候補者Renさんに対して「彼」と呼び続けています。あなたも同じ面接パネルに同席しています。',
      en: 'During a mid-career interview, one of the interviewers keeps referring to the candidate, Ren — who\'s told them beforehand they\'re non-binary — as "he." You\'re on the same interview panel.'
    },
    yourPosition: { ja: 'あなたは同じ面接パネルに座るもう一人の面接官です。', en: "You're another interviewer sitting on the same panel." },
    dialogue1: { ja: '彼の経歴を見ると、前職でもリーダー経験があるようですね', en: "Looking at his background, sounds like he's led teams before too." },
    dialogue1Speaker: { ja: '面接官', en: 'The interviewer' },
    dialogue3: { ja: 'あ、その…はい、そうですね', en: "Oh, um... yes, that's right." },
    dialogue3Speaker: { ja: 'Renさん', en: 'Ren' },
    choices: [
      {
        id: 'say-nothing-interview',
        text: { ja: '特に何も言わず、面接を進める', en: 'Say nothing and continue the interview' },
        feedback: {
          ja: '気まずさを感じても、その場で何も言わないと、Renさんが「代名詞を間違えられても仕方ない」という空気を感じ取ってしまうかもしれません。面接という評価の場だからこそ、誰かが気づいて対応することが重要です。',
          en: "It's understandable to feel awkward, but staying silent risks sending Ren the message that getting misgendered is just something to brush off. In an evaluative setting like an interview, having someone notice and address it matters."
        },
        isRecommended: false,
        strategy: 'none'
      },
      {
        id: 'raise-with-hr',
        text: { ja: '面接後、人事担当に「代名詞の確認が漏れていた」と伝える', en: 'After the interview, tell HR that pronoun confirmation was missed' },
        feedback: {
          ja: '良い判断です。個人の問題として抱え込まず、採用プロセス全体の課題として人事に共有することで、次回以降の面接官全体への研修や事前確認の仕組み改善につながります。Delegate（委ねる）は、構造的な問題に対して有効な手段です。',
          en: 'Good call. Rather than carrying this as a personal issue, sharing it with HR frames it as a process gap — which can lead to training or a pre-interview confirmation step for every interviewer going forward. "Delegate" works well for structural issues like this.'
        },
        isRecommended: true,
        strategy: 'delegate'
      },
      {
        id: 'document-note',
        text: { ja: '面接メモに「代名詞の確認・訂正が必要だった」と客観的に記録しておく', en: 'Note in the interview record that pronoun confirmation/correction was needed' },
        feedback: {
          ja: '良い判断です。その場で指摘しづらくても、記録を残すことで後から採用プロセスを振り返る材料になります。Document（記録する）は、その場での衝突を避けつつ、次につなげる方法です。',
          en: 'Good call. Even if it\'s hard to raise in the moment, keeping a record gives you something to revisit when reviewing the hiring process. "Document" lets you sidestep an in-the-moment clash while still working toward a fix.'
        },
        isRecommended: true,
        strategy: 'document'
      },
      {
        id: 'correct-pronoun',
        text: { ja: '「Renさんの代名詞は『彼』ではなかったと思います」とその場で伝える', en: '"I don\'t think Ren\'s pronouns were \'he\'" — say it in the moment' },
        feedback: {
          ja: '勇気ある行動です。その場で修正することで、Renさんが自分で訂正する負担を負わずに済みます。ただし相手の反応は様々なので、その後の流れにも注意しましょう。',
          en: "A brave move. Correcting it on the spot means Ren doesn't have to carry the burden of correcting it themselves. Reactions vary though, so stay attentive to how it lands."
        },
        isRecommended: true,
        strategy: 'direct',
        reactions: {
          defensive: {
            speakerName: { ja: '面接官', en: 'The interviewer' },
            reactionText: { ja: 'え、履歴書にはそう書いてあったので…そんなに大きな問題ですか？', en: "Oh — that's what the résumé said... is this really that big a deal?" },
            explanation: {
              ja: '指摘を「自分のミス」として重く受け止め、防御的になるパターンです。責める意図がないことを伝えつつ、今後の確認方法に焦点を当てると受け入れられやすくなります。',
              en: 'This is a pattern where the person takes the correction as a personal failure and gets defensive. Making clear you\'re not attacking them, while steering toward how confirmations should work going forward, tends to land better.'
            }
          },
          confused: {
            speakerName: { ja: '面接官', en: 'The interviewer' },
            reactionText: { ja: 'あ、そうなんですか？履歴書だけだとわからなかったです…', en: "Oh, really? I couldn't tell from the résumé alone..." },
            explanation: {
              ja: '悪気なく、書類の情報だけを頼りにしていたパターンです。確認不足に気づいていないだけなので、事実を伝えるだけで十分なことが多いです。',
              en: "This is an innocent pattern — the interviewer was just going off paperwork and hadn't realized the gap. Simply stating the fact is often enough to prompt a fix."
            }
          },
          reflective: {
            speakerName: { ja: '面接官', en: 'The interviewer' },
            reactionText: { ja: 'あ…すみません、確認せずに決めつけていました。ありがとうございます', en: 'Oh... sorry, I assumed without checking. Thank you for saying something.' },
            explanation: {
              ja: '一番理想的な反応です。指摘を素直に受け止められる相手であれば、その場で採用プロセスの質を改善する一歩になります。',
              en: "One of the best-case reactions. When someone takes a correction in stride, it becomes a real step toward improving the hiring process itself."
            }
          }
        }
      }
    ]
  }
]
