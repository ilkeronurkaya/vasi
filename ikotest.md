1. Login sonrası premium'a geçmek istediğimde görünen paket bilgileri hardcoded.
2. Mehmet Kaya kullanıcısı Personal diye bir isimle görünüyor. Personel mi demek yoksa Premium mu denmek istendi. Kontrol edilmesi gerekiyor.
3. Admin paneldeki Teslimatları Çalıştır butonu tasarım olarak bize uygun değil. Üzerine çalışalım.
4. Genel Bakış plan dağılımı tasarımı değişmeli. Anlaşılmıyor. Bunun için Pie Chart iyi olur. Araştırıp bulabilir misin yoksa bana söyle ben bulayım.
5. Premium test kullanıcı ekler misin?
6. Ayarlardaki plan limitleri paket içeriğine göre değişebilmeli. Paket yaratma, edit etme ve silme olabilmeli. Eğer paketi kullanan herhangi bir kullanıcı varsa paket silinememeli.
7. Kullanıcı askıya al dedim yapamadı. Hata mesajı aşağıda;
✘ [ERROR] Error: D1_TYPE_ERROR: Type 'undefined' not supported for value 'undefined'

      at null.<anonymous> (cloudflare-internal:d1-api:310:19)
      at [object Object]
      ... 3 lines matching cause stack trace ...
      at async drainBody
  (file:///Users/ilkeronk_m5pro/Projects/vasi/node_modules/.pnpm/wrangler@4.98.0_@cloudflare+workers-types@4.20260608.1/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts:5:10)
  {
    [cause]: Error: Type 'undefined' not supported for value 'undefined'
        at null.<anonymous> (cloudflare-internal:d1-api:311:24)
        at [object Object]
        at D1PreparedStatement.bind (cloudflare-internal:d1-api:282:42)
        at Array.<anonymous>
  (file:///Users/ilkeronk_m5pro/Projects/vasi/vasi-api/src/routes/admin.ts:144:6)
        at async jsonError
  (file:///Users/ilkeronk_m5pro/Projects/vasi/node_modules/.pnpm/wrangler@4.98.0_@cloudflare+workers-types@4.20260608.1/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts:22:10)
        at async drainBody
  (file:///Users/ilkeronk_m5pro/Projects/vasi/node_modules/.pnpm/wrangler@4.98.0_@cloudflare+workers-types@4.20260608.1/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts:5:10)
  }


[wrangler:info] PATCH /api/v1/admin/users/0a931194-6b02-428c-ac5f-d4587923828d/status 500 Internal Server Error (13ms)