export const RECOGNISE_PROMPT = `You are looking at a photo of a home appliance or consumer electronics product.
Read every label, nameplate, sticker, screen-print and engraving visible in the image.

Return ONLY a JSON object. No markdown fences, no commentary.

{
  "brand": "manufacturer / brand name, or null",
  "model": "the model number exactly as printed, or null",
  "product_name": "what kind of product this is, e.g. 'inverter refrigerator', or null",
  "category": "one id from the list below, or null",
  "visible_text": "all text you can read, separated by | "
}

Category ids. Taiwanese nameplates usually print this in Chinese right after 品名:
  aircon         air conditioner, air purifier, 冷氣, 空調, 空氣清淨機, 清淨機
  waterPurifier  water purifier, water filter, 淨水器, 濾水壺
  washer         washing machine, 洗衣機
  fridge         refrigerator, freezer, 冰箱
  dehumidifier   dehumidifier, 除濕機
  waterHeater    water heater, 熱水器
  tv             television, monitor, 電視, 螢幕
  other          a home appliance that fits none of the above

Rules:
- Read "category" off the label when the product type is printed there; otherwise judge from the
  appearance of the product. Use null if you cannot tell.
- "category" must be exactly one of the ids in the left column above
  (verbatim spelling, English only, single value).
- Copy "model" character-by-character. Never guess or complete a partially visible code —
  if illegible, use null.
- "model" must contain ONLY the code itself — no explanation or parenthetical notes.
  e.g. "RD-240HG", never "RD-240HG (printed next to 機型)". Put commentary in "visible_text" instead.
- A model number is NOT a serial number, part number, barcode digits, batch code, or a rating like "220V 50Hz 1200W".`;
