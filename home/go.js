// Short links for zahin.org (e.g. zahin.org/book).
//
// GitHub Pages can't do server redirects, so each short link is a tiny page
// (home/<slug>/index.html) that sets window.GO_SLUG and loads this file.
// This file logs the click to PostHog, tags the destination with UTM params,
// and forwards the visitor.
//
// To add a link: add an entry below, then copy home/book/ to home/<slug>/
// and change GO_SLUG in it.

const LINKS = {
  book: { to: 'https://cal.com/zahin-mohammad/meeting', src: 'website' },
}

// Public project key from the "zahin.org" PostHog project (starts with phc_).
// It can only send events, not read data, so it's safe to commit.
// Leave empty to skip click tracking; the redirect still works.
const POSTHOG_KEY = 'phc_xZXsmExuerfueHCGR6XBvStcacQLSYH398PM2RTLc9kk'
const POSTHOG_HOST = 'https://us.i.posthog.com'

;(function () {
  const slug = window.GO_SLUG
  const link = LINKS[slug]
  if (!link) return

  // Forward whatever params the visitor arrived with (e.g. ?utm_campaign=techweek),
  // defaulting utm_source/utm_medium to this link's source.
  const incoming = new URLSearchParams(location.search)
  const dest = new URL(link.to)
  incoming.forEach((value, key) => dest.searchParams.set(key, value))
  if (!dest.searchParams.has('utm_source')) dest.searchParams.set('utm_source', link.src)
  if (!dest.searchParams.has('utm_medium')) dest.searchParams.set('utm_medium', 'shortlink')

  if (POSTHOG_KEY) {
    const props = {
      slug,
      source: dest.searchParams.get('utm_source'),
      destination: link.to,
      $current_url: location.href,
      $referrer: document.referrer || '$direct',
      // Anonymous event: don't create a person profile per click.
      $process_person_profile: false,
    }
    incoming.forEach((value, key) => {
      if (key.startsWith('utm_')) props[key] = value
    })
    const body = JSON.stringify({
      api_key: POSTHOG_KEY,
      event: 'booking_link_clicked',
      distinct_id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2),
      properties: props,
    })
    // sendBeacon survives the navigation below, so no need to wait before redirecting.
    try {
      navigator.sendBeacon(POSTHOG_HOST + '/i/v0/e/', new Blob([body], { type: 'text/plain' }))
    } catch (e) {}
  }

  location.replace(dest.toString())
})()
