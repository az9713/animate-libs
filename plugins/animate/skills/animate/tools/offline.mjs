// Block every http(s) request from a Playwright page or context, and fail the run when one is tried.
// A piece is one file with libraries inlined (build.mjs exempts libs/ from its URL check): this is the run-time check.
//   import { blockNetwork } from './offline.mjs';  await blockNetwork(page);   // before page.goto
export async function blockNetwork(target) {
  await target.route(/^https?:/i, (route) => {
    console.error('BLOCKED network request:', route.request().url());
    process.exitCode = 1;
    return route.abort();
  });
}
