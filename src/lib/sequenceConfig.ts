/** فریم‌های sequence — ترتیب = ترتیب اسکرول (فریم ۱ → آخر) */
export const SEQUENCE_FRAMES = [
    "1.JPG",
    "2.JPG",
    "3.JPG",
    "4.JPG",
    "5.JPG",
    "6.JPG",
    "7.JPG",
    "8.JPG",
    "9.JPG",
    "10.JPG",
    "11.JPG",
    "12.JPG",
    "13.JPG",
    "14.JPG",
    "15.JPG",
    "16.JPG",
    "17.JPG",
    "18.JPG",
    "19.JPG",
    "20.JPG",
    "21.JPG",
    "22.JPG",
    "23.JPG",
    "24.JPG",
    "25.JPG",
    "26.JPG",
    "27.png",
    "28.png",
    "29.png",
    "30.png",
    "31.png",
    "32.png",
    "33.png",
] as const;

export const FRAME_COUNT = SEQUENCE_FRAMES.length;

/** ابعاد سورس همه فریم‌ها (پیکسل) */
export const SEQUENCE_SOURCE = { width: 2732, height: 2048 };

/** index = 1-based (۱ → اولین فریم) */
export function framePath(index: number): string {
    const file = SEQUENCE_FRAMES[index - 1];
    if (!file) throw new RangeError(`Frame index out of range: ${index}`);
    return `/images/seq/${file}`;
}
