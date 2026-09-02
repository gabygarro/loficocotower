import type { PageContext } from "vike/types";

export default (pageContext: PageContext) => {
  const isProduction = import.meta.env.PROD;
  if (isProduction) {
    return `
      <!-- Privacy-friendly analytics by Plausible -->
      <script async src="https://plausible.io/js/pa-njte1QHn-wQqETGbA9IaL.js"></script>
      <script>
        window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
        plausible.init()
      </script>
    `;
  }
  return '';
};
