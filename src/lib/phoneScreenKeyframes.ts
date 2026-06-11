import { FRAME_COUNT, SEQUENCE_SOURCE } from "@/lib/sequenceConfig";

export { SEQUENCE_SOURCE };

/**
 * ═══════════════════════════════════════════════════════════════════
 *  PHONE SCREEN KEYFRAMES — راهنمای تنظیم
 * ═══════════════════════════════════════════════════════════════════
 *
 *  این فایل مشخص می‌کند «سوراخ» صفحه گوشی (hole) کجای هر فریم باشد
 *  تا محتوای سایت (HeroContent) از پشت canvas دیده شود.
 *
 *  ── سیستم مختصات ──
 *  همه اعداد بر حسب پیکسل سورس عکس‌هاست (SEQUENCE_SOURCE = 2732×2048).
 *  index فریم = ۰-based:
 *    0  → 1.JPG  (اولین عکس sequence)
 *    32 → 33.png (آخرین عکس)
 *
 *  ── keyframe گوشی (off-center) ──
 *  گوشی وسط تصویر نیست و موقع بزرگ شدن جابه‌جا می‌شود، پس از screenAt استفاده می‌کنیم:
 *    screenAt(cx, cy, w, r)
 *             ↑   ↑   ↑  ↑
 *             │   │   │  └─ border-radius گوشه hole (پیکسل سورس)
 *             │   │   └──── عرض landscape صفحه گوشی
 *             │   └──────── مرکز عمودی (پیکسل سورس)
 *             └──────────── مرکز افقی (پیکسل سورس)
 *             h خودکار از LAPTOP_SCREEN_ASPECT (16:10) حساب می‌شود
 *
 *  مقادیر فعلی دقیقاً از روی مارک‌های سبز فریم‌های 1،2،3،12،24،31 اندازه‌گیری شده‌اند.
 *  (مرکز و عرض از bounding box سبز؛ ارتفاع روی 16:10 قفل شده.)
 *
 *  ── میزان تغییر بین فریم‌ها ──
 *  فریم‌هایی که اینجا تعریف نکنی، بین دو keyframe مجاور interpolate می‌شوند
 *  (هم مرکز، هم اندازه نرم حرکت می‌کنند).
 *
 *  برای کنترل بیشتر روی مسیر/سرعت:
 *    • keyframe بیشتر از روی فریم‌های دیگر اضافه کن
 *    • مرکز (cx, cy) را عوض کن تا مسیر حرکت گوشی را تنظیم کنی
 *    • اختلاف w بین دو keyframe زیاد = جهش بزرگ‌تر در آن بازه
 *
 *  ── fullscreen blend ──
 *  FULLSCREEN_BLEND_FROM = از کدام فریم به بعد خودکار به fullscreen لپتاپ برسد.
 *  عدد کوچک‌تر → زودتر fullscreen   |   عدد بزرگ‌تر → دیرتر fullscreen
 *  الان = 30 (آخرین مارک سبز)، یعنی فریم‌های 30→32 به تمام‌صفحه می‌رسند.
 *
 * ═══════════════════════════════════════════════════════════════════
 */

/** نسبت landscape لپتاپ — h = w / این عدد */
export const LAPTOP_SCREEN_ASPECT = 16 / 10;

export type PixelRect = {
    x: number;
    y: number;
    w: number;
    h: number;
    r: number;
};

export function centeredScreen(w: number, h: number, r = 8): PixelRect {
    return {
        x: Math.round((SEQUENCE_SOURCE.width - w) / 2),
        y: Math.round((SEQUENCE_SOURCE.height - h) / 2),
        w,
        h,
        r,
    };
}

/** صفحه landscape وسط تصویر — فقط w و r لازم است؛ x/y خودکار */
export function centeredLandscape(w: number, r = 6): PixelRect {
    const h = Math.round(w / LAPTOP_SCREEN_ASPECT);
    return centeredScreen(w, h, r);
}

/**
 * صفحه landscape با مرکز دلخواه (cx, cy) و عرض w — ارتفاع از 16:10 حساب می‌شود.
 * برای وقتی گوشی وسط تصویر نیست و موقع اسکرول جابه‌جا می‌شود.
 *   cx, cy → مرکز سوراخ بر حسب پیکسل سورس
 *   w      → عرض landscape بر حسب پیکسل سورس
 *   r      → شعاع گوشه
 */
export function screenAt(cx: number, cy: number, w: number, r = 4): PixelRect {
    const h = Math.round(w / LAPTOP_SCREEN_ASPECT);
    return {
        x: Math.round(cx - w / 2),
        y: Math.round(cy - h / 2),
        w: Math.round(w),
        h,
        r,
    };
}

/**
 * rect سورس که بعد از cover دقیقاً کل viewport را بپوشاند.
 * آخر sequence → hero با scale:1 و بدون jump.
 */
export function viewportFullscreenRect(
    imgW: number,
    imgH: number,
    vw: number,
    vh: number
): PixelRect {
    const scale = Math.max(vw / imgW, vh / imgH);
    const dx = (vw - imgW * scale) / 2;
    const dy = (vh - imgH * scale) / 2;

    return {
        x: -dx / scale,
        y: -dy / scale,
        w: vw / scale,
        h: vh / scale,
        r: 0,
    };
}

const LAST_FRAME = FRAME_COUNT - 1; // الان = 32

/**
 * از این فریم به بعد، hole خودکار به fullscreen viewport لپتاپ blend می‌شود.
 * keyframe دستی بعد از این index دیگر اثر ندارد (مگر FULLSCREEN_BLEND_FROM را عوض کنی).
 */
const FULLSCREEN_BLEND_FROM = 30;

/**
 * ┌─────────────────────────────────────────────────────────────┐
 * │  KEYFRAMEهای دستی — فقط این object را ویرایش کن            │
 * └─────────────────────────────────────────────────────────────┘
 *
 *  قالب:
 *    [index فریم]: screenAt(مرکزX, مرکزY, عرض, شعاع_گوشه)
 *
 *  index = شماره فریم ۰-based (باید با SEQUENCE_FRAMES در sequenceConfig هم‌خوان باشد)
 */
export const PHONE_SCREEN_KEYFRAMES: Record<number, PixelRect> = {
    // ── مرکز/عرض دقیقاً از روی مارک‌های سبز اندازه‌گیری شده ──
    // مقادیر: screenAt(centerX, centerY, width) — ارتفاع همیشه 16:10
    // گوشی وسط نیست و موقع بزرگ شدن به پایین حرکت می‌کند (cy بالا می‌رود).

    // فریم 1 (index 0) — کوچک‌ترین حالت، نزدیک سینه
    0: screenAt(1381, 936, 94, 2),

    // فریم 2 (index 1)
    1: screenAt(1387, 937, 114, 2),

    // فریم 3 (index 2)
    2: screenAt(1384, 937, 104, 3),

    // فریم 12 (index 11) — فریم‌های 3–11 بین مارک فریم۳ و این interpolate می‌شوند
    11: screenAt(1351, 940, 151, 4),

    // فریم 24 (index 23) — فریم‌های 12–23 interpolate
    23: screenAt(1393, 1037, 350, 6),

    // فریم 31 (index 30) — تقریباً تمام‌صفحه.
    // مرکز روی مرکز تصویر (1366, 1024) قفل شده — همان مرکزی که fullscreen به آن می‌رسد —
    // تا در چند فریم آخر صفحه پایین نرود و دوباره بالا نیاید؛ فقط صاف بزرگ و وسط شود.
    // فریم‌های 24–30 interpolate | فریم‌های 30–32 → fullscreen (فقط زوم، بدون جابه‌جایی)
    30: screenAt(1366, 1024, 1615, 10),
};

const KEYFRAME_INDICES = Object.keys(PHONE_SCREEN_KEYFRAMES)
    .map(Number)
    .sort((a, b) => a - b);

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

function lerpRect(a: PixelRect, b: PixelRect, t: number): PixelRect {
    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
        w: lerp(a.w, b.w, t),
        h: lerp(a.h, b.h, t),
        r: lerp(a.r, b.r, t),
    };
}

function interpolateKeyframes(frameIndex: number): PixelRect {
    const idx = Math.max(0, Math.min(frameIndex, FULLSCREEN_BLEND_FROM));

    let lower = KEYFRAME_INDICES[0];
    let upper = KEYFRAME_INDICES[KEYFRAME_INDICES.length - 1];

    for (let i = 0; i < KEYFRAME_INDICES.length - 1; i++) {
        if (idx >= KEYFRAME_INDICES[i] && idx <= KEYFRAME_INDICES[i + 1]) {
            lower = KEYFRAME_INDICES[i];
            upper = KEYFRAME_INDICES[i + 1];
            break;
        }
    }

    if (lower === upper) return PHONE_SCREEN_KEYFRAMES[lower];

    const t = (idx - lower) / (upper - lower);
    return lerpRect(PHONE_SCREEN_KEYFRAMES[lower], PHONE_SCREEN_KEYFRAMES[upper], t);
}

export function getPhoneScreenRect(
    frameIndex: number,
    vw: number,
    vh: number
): PixelRect {
    const idx = Math.max(0, Math.min(frameIndex, LAST_FRAME));
    const fullscreen = viewportFullscreenRect(
        SEQUENCE_SOURCE.width,
        SEQUENCE_SOURCE.height,
        vw,
        vh
    );

    if (idx >= LAST_FRAME) return fullscreen;

    if (idx >= FULLSCREEN_BLEND_FROM) {
        const base = interpolateKeyframes(FULLSCREEN_BLEND_FROM);
        const t = (idx - FULLSCREEN_BLEND_FROM) / (LAST_FRAME - FULLSCREEN_BLEND_FROM);
        return lerpRect(base, fullscreen, t);
    }

    return interpolateKeyframes(idx);
}

export function getCoverTransform(
    imgW: number,
    imgH: number,
    vw: number,
    vh: number
) {
    const scale = Math.max(vw / imgW, vh / imgH);
    const dw = imgW * scale;
    const dh = imgH * scale;
    const dx = (vw - dw) / 2;
    const dy = (vh - dh) / 2;
    return { scale, dx, dy };
}

export function phoneRectToViewport(
    rect: PixelRect,
    imgW: number,
    imgH: number,
    vw: number,
    vh: number
) {
    const { scale, dx, dy } = getCoverTransform(imgW, imgH, vw, vh);
    return {
        x: dx + rect.x * scale,
        y: dy + rect.y * scale,
        w: rect.w * scale,
        h: rect.h * scale,
        r: Math.max(0, rect.r * scale),
    };
}

/** hero transform وقتی hole = کل viewport — برای sync فاز متن */
export function isViewportFullscreenScreen(
    screen: { w: number; h: number },
    vw: number,
    vh: number,
    epsilon = 1.5
) {
    return (
        Math.abs(screen.w - vw) < epsilon && Math.abs(screen.h - vh) < epsilon
    );
}
