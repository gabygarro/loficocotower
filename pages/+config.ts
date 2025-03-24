import vikeReact from "vike-react/config";
import type { Config } from "vike/types";

const statcounterHTML = `
<!-- Default Statcounter code for Loficocotower
https://loficocotower.online/ -->
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
<!-- End of Statcounter Code -->
`;

export default {
  extends: vikeReact,
  bodyHtmlEnd: (pageContext) => {
    const hostname = pageContext.urlParsed?.hostname;
    // Only include script if domain exactly matches production domain
    if (hostname === 'loficocotower.online') {
      return statcounterHTML;
    }
    return '';
  },
} satisfies Config;
