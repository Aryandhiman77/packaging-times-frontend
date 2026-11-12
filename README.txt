MERGE PATCH BASE: client(3).zip
Only 3 client files changed. server(3).zip remains unchanged.
Preserves newest signup / subscription pages, PDF header footer logos, skeleton loaders, CMS, SEO.
Restores old category-content-page banner selection via ?page=slug and old hidden shopping-cart redirect.
Test: npm ci && npm run build; confirm page-specific ads, subscription paths, cart redirect.
