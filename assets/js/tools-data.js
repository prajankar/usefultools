/* Catalog of every tool on the site. One entry = one page in /tools/.
   server:true marks tools that cannot work in the browser alone. */
window.CATEGORIES = [
  { id:"image",    label:"Image tools",        blurb:"Convert, resize and compress pictures without uploading them anywhere." },
  { id:"seo",      label:"SEO tools",          blurb:"Generate and check the files and tags search engines read." },
  { id:"text",     label:"Text tools",         blurb:"Count, convert, read aloud and rewrite text." },
  { id:"dev",      label:"Developer tools",    blurb:"Format, minify and encode the things you paste all day." },
  { id:"math",     label:"Calculators",        blurb:"Everyday numbers: money, dates, health and maths." },
  { id:"unit",     label:"Unit converters",    blurb:"Switch between metric, imperial and everything in between." },
  { id:"security", label:"Security tools",     blurb:"Hashes, passwords and privacy documents." },
  { id:"social",   label:"Social media tools", blurb:"Write posts, count characters and grab public assets." }
];

window.TOOLS_LIST = [
  // --- Image (10)
  ["image-to-png","Image to PNG converter","image","Turn JPG, WebP, GIF or BMP files into PNG."],
  ["image-to-jpg","Image to JPG converter","image","Save any image as JPG and pick the quality."],
  ["image-resizer","Image resizer","image","Set an exact width and height, or scale by percentage."],
  ["image-compressor","Image compressor","image","Shrink file size by lowering JPG/WebP quality."],
  ["image-cropper","Image cropper","image","Drag a box over your image and keep only that part."],
  ["image-to-base64","Image to Base64","image","Get a data URI you can paste straight into CSS or HTML."],
  ["webp-to-png","WebP to PNG converter","image","Convert WebP images so older software can open them."],
  ["gif-maker","GIF maker","image","Build an animated GIF from a series of images."],
  ["qr-code-generator","QR code generator","image","Make a QR code for a link, text, phone number or Wi-Fi."],
  ["images-to-pdf","Screenshot to PDF converter","image","Combine screenshots or photos into one PDF."],

  // --- SEO (10)
  ["meta-tag-generator","Meta tag generator","seo","Write title, description, Open Graph and Twitter tags."],
  ["keyword-density-checker","Keyword density checker","seo","See which words and phrases dominate a page of copy."],
  ["sitemap-generator","Sitemap generator","seo","Turn a list of URLs into a valid sitemap.xml."],
  ["robots-txt-generator","Robots.txt generator","seo","Build a robots.txt with allow, disallow and crawl rules."],
  ["google-index-checker","Google index checker","seo","Check whether your pages are in Google's index.",1],
  ["domain-authority-checker","Domain authority checker","seo","Look up third-party authority scores for a domain.",1],
  ["backlink-checker","Backlink checker","seo","List the sites linking to a domain.",1],
  ["page-speed-checker","Page speed checker","seo","Run a PageSpeed Insights report for a URL.",1],
  ["xml-sitemap-validator","XML sitemap validator","seo","Check a sitemap for broken structure and bad URLs."],
  ["mobile-friendly-test","Mobile-friendly test","seo","Preview a page at phone, tablet and desktop widths."],

  // --- Text (10)
  ["word-counter","Word counter","text","Words, sentences, paragraphs and reading time as you type."],
  ["character-counter","Character counter","text","Count characters with and without spaces, live."],
  ["case-converter","Case converter","text","Switch between sentence, title, camel, snake and more."],
  ["plagiarism-checker","Plagiarism checker","text","Compare text against sources on the web.",1],
  ["grammar-checker","Grammar checker","text","Catch common writing slips offline; no text is uploaded."],
  ["text-to-speech","Text to speech","text","Read text aloud with the voices installed on your device."],
  ["speech-to-text","Speech to text","text","Dictate into your microphone and get editable text."],
  ["url-encoder-decoder","URL encoder and decoder","text","Percent-encode text or decode a messy link."],
  ["fancy-text-generator","Fancy text generator","text","Bold, italic, bubble and upside-down Unicode styles."],
  ["random-text-generator","Random text generator","text","Lorem ipsum or plain English filler, by word or paragraph."],

  // --- Developer (10)
  ["json-formatter","JSON formatter","dev","Pretty-print, minify and validate JSON."],
  ["html-to-markdown","HTML to Markdown converter","dev","Paste HTML, get clean Markdown."],
  ["css-minifier","CSS minifier","dev","Strip comments and whitespace from stylesheets."],
  ["js-minifier","JavaScript minifier","dev","Remove comments and blank space from scripts."],
  ["sql-formatter","SQL formatter","dev","Break long queries onto readable lines."],
  ["htaccess-redirect-generator","HTACCESS redirect generator","dev","Write 301 rules, www and HTTPS redirects."],
  ["markdown-to-html","Markdown to HTML converter","dev","Convert Markdown into HTML you can paste anywhere."],
  ["color-code-picker","Colour code picker","dev","Pick a colour and copy it as HEX, RGB or HSL."],
  ["base64-encoder-decoder","Base64 encoder and decoder","dev","Encode or decode text, with full Unicode support."],
  ["ip-address-lookup","IP address lookup","dev","See details for your own IP or any address you enter.",1],

  // --- Math (10)
  ["percentage-calculator","Percentage calculator","math","Percent of a number, change between two numbers, and more."],
  ["age-calculator","Age calculator","math","Exact age in years, months, days and next birthday."],
  ["bmi-calculator","BMI calculator","math","Body mass index in metric or imperial units."],
  ["loan-emi-calculator","Loan EMI calculator","math","Monthly payment, total interest and full amortisation."],
  ["scientific-calculator","Scientific calculator","math","Trigonometry, logs, powers and roots with a keypad."],
  ["discount-calculator","Discount calculator","math","Sale price, amount saved and effective discount."],
  ["currency-converter","Currency converter","math","Convert amounts using a rate you enter or fetch."],
  ["time-zone-converter","Time zone converter","math","See one moment in several cities at once."],
  ["binary-to-decimal","Binary to decimal converter","math","Convert between binary, octal, decimal and hex."],
  ["tip-calculator","Tip calculator","math","Tip, total and the split per person."],

  // --- Units (10)
  ["length-converter","Length converter","unit","Millimetres to miles and everything between."],
  ["weight-converter","Weight converter","unit","Grams, kilos, pounds, ounces, stones and tonnes."],
  ["speed-converter","Speed converter","unit","km/h, mph, m/s, knots and mach."],
  ["temperature-converter","Temperature converter","unit","Celsius, Fahrenheit and Kelvin."],
  ["volume-converter","Volume converter","unit","Litres, gallons, cups, pints and fluid ounces."],
  ["data-storage-converter","Data storage converter","unit","Bytes to terabytes, in both decimal and binary."],
  ["energy-converter","Energy converter","unit","Joules, calories, kilowatt-hours and BTU."],
  ["pressure-converter","Pressure converter","unit","Pascal, bar, psi, atm and mmHg."],
  ["fuel-efficiency-converter","Fuel efficiency converter","unit","mpg, km/L and litres per 100 km."],
  ["angle-converter","Angle converter","unit","Degrees, radians, gradians and turns."],

  // --- Security (10)
  ["md5-hash-generator","MD5 hash generator","security","Hash text with MD5 for checksums and legacy systems."],
  ["sha256-hash-generator","SHA-256 hash generator","security","Generate SHA-1, SHA-256 or SHA-512 digests."],
  ["password-generator","Password generator","security","Strong random passwords and passphrases."],
  ["random-string-generator","Random string generator","security","Tokens, IDs and test data in any alphabet."],
  ["url-shortener","URL shortener","security","Create and store short links.",1],
  ["ip-geolocation-finder","IP geolocation finder","security","Approximate country, city and network for an IP.",1],
  ["ssl-certificate-checker","SSL certificate checker","security","Inspect a site's certificate and expiry date.",1],
  ["whois-lookup","Whois lookup","security","Registrar, dates and nameservers for a domain.",1],
  ["http-headers-checker","HTTP headers checker","security","Read the response headers a URL sends.",1],
  ["privacy-policy-generator","Privacy policy generator","security","Draft a privacy policy for your own site."],

  // --- Social (10)
  ["youtube-thumbnail-downloader","YouTube thumbnail downloader","social","Get every public thumbnail size for a video."],
  ["instagram-photo-downloader","Instagram photo downloader","social","Save photos from Instagram posts.",2],
  ["twitter-video-downloader","Twitter video downloader","social","Save videos from posts on X.",2],
  ["facebook-video-downloader","Facebook video downloader","social","Save videos from Facebook posts.",2],
  ["tiktok-video-downloader","TikTok video downloader","social","Save videos from TikTok.",2],
  ["youtube-tags-extractor","YouTube tags extractor","social","List the tags on a public video.",1],
  ["hashtag-generator","Hashtag generator","social","Turn a topic into a set of hashtags to test."],
  ["social-media-post-generator","Social media post generator","social","Draft a post sized for each network."],
  ["emoji-keyboard","Emoji keyboard","social","Search emoji and copy them with one click."],
  ["twitter-character-counter","X / Twitter character counter","social","Count characters the way X does, links included."]
];

/* normalise into objects */
window.TOOLS_DATA = window.TOOLS_LIST.map(function (t) {
  return { slug:t[0], name:t[1], cat:t[2], desc:t[3], server:t[4] || 0 };
});
