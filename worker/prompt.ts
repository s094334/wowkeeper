/**
 * 銘牌辨識的指令。這份是評測跑出來的版本，四個要求都是實測後才加的：
 *
 * 1. 只回 JSON —— 才能自動解析，不用人工讀。
 * 2. 逐字抄型號 —— 壓低模型自行補完的機率。
 * 3. 區分型號 vs 序號 vs 料號 —— 家電銘牌最常見的混淆點。
 * 4. 多要一個 visible_text —— 就算 model 抓錯，也看得出模型「有沒有讀到」，
 *    debug 時能分辨是眼睛不好還是選錯欄位。
 *
 * 刻意不要中文欄位：測試時放過一個 product_name_zh，讓 Moondream 陷入重複輸出
 * 迴圈吃光 max_tokens，JSON 沒收尾就被截斷。翻譯留在前端做。
 */
export const RECOGNISE_PROMPT = `You are looking at a photo of a home appliance or consumer electronics product.
Read every label, nameplate, sticker, screen-print and engraving visible in the image.

Return ONLY a JSON object. No markdown fences, no commentary.

{
  "brand": "manufacturer / brand name, or null",
  "model": "the model number exactly as printed, or null",
  "product_name": "what kind of product this is, e.g. 'inverter refrigerator', or null",
  "visible_text": "every piece of text you can read in the image, separated by | ",
  "confidence": 0.0
}

Rules:
- Copy "model" character-by-character from the image. Never guess, never complete a partially visible code.
- "model" must contain ONLY the code itself. No explanation, no parenthetical notes, no surrounding
  words, no quotes. Write "RD-240HG", never "RD-240HG (printed next to 機型)". Put any commentary
  in "visible_text" instead.
- A model number is NOT a serial number, part number, barcode digits, batch code, or a rating like "220V 50Hz 1200W".
- If no model number is legible, set "model" to null rather than inventing one.
- "confidence" is your confidence in the "model" field, from 0.0 to 1.0.`;
