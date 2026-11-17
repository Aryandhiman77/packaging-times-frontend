MERGE PATCH BASE: client(3).zip
Only 3 client files changed. server(3).zip remains unchanged.
Preserves newest signup / subscription pages, PDF header footer logos, skeleton loaders, CMS, SEO.
Category-content-page selection uses ?page=slug and the public header exposes CMS category dropdowns.
Test: npm ci && npm run build; confirm page-specific ads, subscription paths, and navigation dropdowns.
