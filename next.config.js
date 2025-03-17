// next.config.js
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Only run on the client side build
    if (!isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.js'),
              to: path.join(__dirname, 'public'),
            },
          ],
        }),
      );
    }
    return config;
  },
  // Add any other Next.js config options here
};

module.exports = nextConfig;
