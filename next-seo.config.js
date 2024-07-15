// next-seo.config.js
export default {
  title: "Lyricist's Room",
  description: "작사가를 위한 창작 공간, Lyricist's Room입니다!",
  canonical: 'https://www.lyricistsroom.com/',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://www.lyricistsroom.com/',
    images: [
      {
        url: 'https://www.lyricistsroom.com/seo.jpg',
        width: 800,
        height: 600,
        alt: 'Og Image Alt',
        type: 'image/jpeg'
      }
    ],
    siteName: "Lyricist's Room"
  },
  twitter: {
    handle: '@example',
    site: '@example',
    cardType: 'summary_large_image'
  }
}
