import type { PageContext } from "vike/types";

export default (pageContext: PageContext) => {
  const hostname = pageContext.urlParsed?.hostname;
  if (hostname === 'loficocotower.online') {
    return `
      <!-- Statcounter code -->
      <script type="text/javascript">
        var sc_project=13072813;
        var sc_invisible=1;
        var sc_security="51cdf448";
      </script>
      <script type="text/javascript"
        src="https://www.statcounter.com/counter/counter.js"
        async></script>
      <noscript><div class="statcounter"><a title="Web Analytics"
        href="https://statcounter.com/" target="_blank"><img
        class="statcounter"
        src="https://c.statcounter.com/13072813/0/51cdf448/1/"
        alt="Web Analytics"
        referrerPolicy="no-referrer-when-downgrade"></a></div></noscript>
    `;
  }
  return '';
};
