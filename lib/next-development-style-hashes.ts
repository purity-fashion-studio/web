// Exact SHA-256 hashes of Next 16.2.11 development DevTools styles.
// Its separate shadow-root renderer does not forward the document nonce.
// Allow only these immutable tooling styles in development, never arbitrary
// inline CSS or production styles. Re-review when upgrading Next.
export const nextDevelopmentStyleHashes = [
  "'sha256-sHwQzC2ZsVrt1faUYCjF/eo8aIoBlQbGjVstzanL9CU='",
  "'sha256-4GzqRlwcGp7cD3kANBs5f/CO/iqLwfJq0WYAq59xN6E='",
  "'sha256-OpIODBPkpoiPLrmWVWQAuUTdbHmO2qBKzuQ9qR3th9M='",
  "'sha256-UAihfItDa9VybE65LGSN8u3Hsk+Obut4I2HMuUxGIAU='",
  "'sha256-oWSHr/vRLelbPs4/D0cMyJPQiBZ++BztsCUSohl+qfA='",
  "'sha256-1Rgj9Tmw9SU4h9nklK6l294O2abdhNs1l+3ZoCwzxUA='",
  "'sha256-F6SKLtWtm7VErmrq0jDQtzJvpz6+LcrSfbyczc2xd6o='",
  "'sha256-+OZewf8eCqvkslh1/Xykl0aVXjayV2Iy+vePINuzTcE='",
  "'sha256-CHox7CF+XF5itK7YJMt8fpMltQv4/krVGqYhlFzvJys='",
  "'sha256-mie6WmUG3QwG7eOyDWBx8Bce20N/LdzUH4Zq20+Xuac='",
  "'sha256-YRU82gRq3tqvclIjICrc9UXxYBl+iOGd7Vv7bhPhyTQ='",
  "'sha256-tzBMNZ7l8nZ/8oEITbEGeJAgNHg7KpJOduvhc+LO138='",
  "'sha256-EGxSJ+22silg1bQ9JENEw9K11R7B+X79u4xwD5Qlxik='",
  "'sha256-9zL9D7V4ZS7/Ejl2hJBaUhvb6Kz0qP63cZJdse7FKNQ='",
  "'sha256-h/GKjXBq1QiwvO1y7p0JkvVZk4w7xTPz2rn2eswXu3k='",
  "'sha256-1RxEtrnAd5b7dSm+dsmII7JA/VKWYqnnpz1uflgEuHM='",
  "'sha256-CUsJx2gBDO+oKhgx2vFJvbgkZLqueGGG5FC5IxI938I='",
  // DevTools' transient rendering-status indicator, inserted on navigation.
  "'sha256-ldz4/HaaQgxl7ClJjMpubp7p5ZryxWGew0BQJ/1ev0M='",
].join(" ")
