import { PlayerVideoOptions } from "textalive-app-api";

export class MusicInfo {
    id: number;
    songUrl: string;
    playerVideoOptions?: PlayerVideoOptions;
    musicVideoUrl?: string;
    singerName: string[];
}

export function findMusicInfo(id: number): MusicInfo {
    // Loading Memories / せきこみごはん feat. 初音ミク
    const lm: MusicInfo = {
        id: 0,
        songUrl: "https://piapro.jp/t/RoPB/20220122172830",
        playerVideoOptions: {
            video: {
                // 音楽地図訂正履歴: https://songle.jp/songs/2243651/history
                beatId: 4086301,
                chordId: 2221797,
                repetitiveSegmentId: 2247682,
                // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FRoPB%2F20220122172830
                lyricId: 53718,
                lyricDiffId: 7076,
            },
        },
        musicVideoUrl: "https://www.youtube.com/watch?v=ZOTJgXBkJpc",
        singerName: ["Miku"],
    };

    // 青に溶けた風船 / シアン・キノ feat. 初音ミク
    const ao: MusicInfo = {
        id: 1,
        songUrl: "https://piapro.jp/t/9cSd/20220205030039",
        playerVideoOptions: {
            video: {
                // 音楽地図訂正履歴: https://songle.jp/songs/2245015/history
                beatId: 4083452,
                chordId: 2221996,
                repetitiveSegmentId: 2247861,
                // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2F9cSd%2F20220205030039
                lyricId: 53745,
                lyricDiffId: 7080,
            },
        },
        singerName: ["Miku"],
    };

    // 歌の欠片と / imo feat. MEIKO
    const uta: MusicInfo = {
        id: 2,
        songUrl: "https://piapro.jp/t/Yvi-/20220207132910",
        playerVideoOptions: {
            video: {
                // 音楽地図訂正履歴: https://songle.jp/songs/2245016/history
                beatId: 4086832,
                chordId: 2222074,
                repetitiveSegmentId: 2247935,
                // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FYvi-%2F20220207132910
                lyricId: 53746,
                lyricDiffId: 7082,
            },
        },
        musicVideoUrl: "https://www.youtube.com/watch?v=CkIy0PdUGjk",
        singerName: ["Meiko"],
    };

    // 未完のストーリー / 加賀（ネギシャワーP） feat. 初音ミク
    const mikan: MusicInfo = {
        id: 3,
        songUrl: "https://piapro.jp/t/ehtN/20220207101534",
        playerVideoOptions: {
            video: {
                // 音楽地図訂正履歴: https://songle.jp/songs/2245017/history
                beatId: 4083459,
                chordId: 2222147,
                repetitiveSegmentId: 2248008,
                // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FehtN%2F20220207101534
                lyricId: 53747,
                lyricDiffId: 7083,
            },
        },
        singerName: ["Miku"],
    };

    // みはるかす / ねこむら（cat nap） feat. 初音ミク
    const miharu: MusicInfo = {
        id: 4,
        songUrl: "https://piapro.jp/t/QtjE/20220207164031",
        playerVideoOptions: {
            video: {
                // 音楽地図訂正履歴: https://songle.jp/songs/2245018/history
                beatId: 4083470,
                chordId: 2222187,
                repetitiveSegmentId: 2248075,
                // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FQtjE%2F20220207164031
                lyricId: 53748,
                lyricDiffId: 7084,
            },
        },
        musicVideoUrl: "https://www.youtube.com/watch?v=qVTavYjd9Ek",
        singerName: ["Miku"],
    };

    // fear / 201 feat. 初音ミク
    const fear: MusicInfo = {
        id: 5,
        songUrl: "https://piapro.jp/t/GqT2/20220129182012",
        playerVideoOptions: {
            video: {
                // 音楽地図訂正履歴: https://songle.jp/songs/2245019/history
                beatId: 4083475,
                chordId: 2222294,
                repetitiveSegmentId: 2248170,
                // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FGqT2%2F20220129182012
                lyricId: 53749,
                lyricDiffId: 7085,
            },
        },
        musicVideoUrl: "https://www.youtube.com/watch?v=ZK2rp1VdNy4",
        singerName: ["Miku"],
    };

    const musicInfo: MusicInfo = [lm, ao, uta, mikan, miharu, fear].filter((music) => music.id === id).pop();
    if (!musicInfo) {
        console.error(`MusicInfo not found. id:${id}`);
    }
    return musicInfo;
}
