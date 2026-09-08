# إضافة خبر أو فيديو

عدّل الملف:

`js/news-data.js`

أضف كائنًا جديدًا داخل `window.portfolioNewsItems` بهذا الشكل:

```js
{
  id: 'my-video-1',
  titleAr: 'اكتب عنوان الخبر بالعربية هنا',
  titleEn: 'Write the news title in English here',
  descriptionAr: 'اكتب وصفًا مختصرًا للفيديو هنا.',
  descriptionEn: 'Write a short description of the video here.',
  url: 'https://www.youtube.com/watch?v=VIDEO_ID',
  date: '2026-09-08',
  thumbnail: ''
}
```

يمكن وضع أي رابط فيديو مباشر مثل `mp4` و`webm` و`ogg`، أو رابط YouTube وVimeo. روابط Instagram وFacebook وLinkedIn وTikTok وX تفتح المنشور الأصلي إذا كانت المنصة لا تسمح بالتضمين.

بعد حفظ الملف حدّث الموقع باستخدام `Ctrl + F5`.
