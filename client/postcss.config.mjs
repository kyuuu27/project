// PostCSS 配置：Tailwind CSS → 自动添加浏览器前缀
const config = {
  plugins: {
    tailwindcss: {},    // 编译 Tailwind 指令 (@tailwind base/components/utilities)
    autoprefixer: {},   // 自动添加 -webkit-, -moz- 等前缀
  },
};

export default config;
