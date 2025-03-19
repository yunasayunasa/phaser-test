export const SampleNovel = {
    scenes: {
        intro: {
            background: 'bg_classroom',
            assets: [
                { type: 'image', key: 'bg_classroom', path: 'assets/backgrounds/classroom.jpg' },
                { type: 'image', key: 'char_mei', path: 'assets/characters/mei.png' },
                { type: 'image', key: 'char_takeshi', path: 'assets/characters/takeshi.png' },
            ],
            dialog: [
                {
                    text: "これはPhaserで実装されたビジュアルノベルコンポーネントのサンプルです。",
                },
                {
                    character: "めい",
                    text: "こんにちは！私はめいです。",
                    characters: [
                        { key: 'char_mei', position: 'center' }
                    ]
                },
                {
                    character: "たけし",
                    text: "よう、俺はたけしだ。",
                    characters: [
                        { key: 'char_takeshi', position: 'right' },
                        { key: 'char_mei', position: 'left' }
                    ]
                },
                {
                    character: "めい",
                    text: "何か選んでみてね！",
                    choices: [
                        { 
                            text: "挨拶する", 
                            nextDialog: 4 
                        },
                        { 
                            text: "去る", 
                            nextScene: "ending" 
                        },
                        { 
                            text: "秘密の選択肢", 
                            condition: "hasSecretKey", 
                            nextScene: "secret" 
                        }
                    ]
                },
                {
                    character: "たけし",
                    text: "挨拶を選んだんだな。いいね！",
                    characters: [
                        { key: 'char_takeshi', position: 'center' }
                    ]
                }
            ]
        },
        
        ending: {
            background: 'bg_sunset',
            assets: [
                { type: 'image', key: 'bg_sunset', path: 'assets/backgrounds/sunset.jpg' }
            ],
            dialog: [
                {
                    text: "こうして物語は終わりました...",
                }
            ]
        }
    }
};