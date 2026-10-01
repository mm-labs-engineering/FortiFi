# Architecture

`createFortiFi` signs an HMAC JWT that names a user and an article. `open` returns the teaser unless that token is still valid for the requested article.

That is the whole system.
