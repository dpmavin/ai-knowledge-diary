import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * The shelf is the front door.
   *
   * This repo carries two implementations of the same product: an earlier
   * React one under `app/`, and the one that is actually designed and
   * maintained, in `public/mockup/`. Left alone, `/` serves the React page,
   * which is not the product.
   *
   * A redirect rather than a rewrite on purpose: the mockup links between its
   * own pages relatively (`book.html?i=3`), so the browser has to actually be
   * standing in `/mockup/` for navigation to resolve. A rewrite would keep the
   * URL at `/` and every link out of the shelf would 404.
   */
  async redirects() {
    return [
      { source: "/", destination: "/mockup/home.html", permanent: false },
    ];
  },
};

export default nextConfig;
