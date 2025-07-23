---
layout: '@/layouts/IndividualPage.astro'

title: 'Copyright'
description: 'Effective date: 2025-07-23'
language: 'En'
back: '/terms/list'
---

<div id="copyright" align="center">
    &copy;  2025 https://jaisons-blog.vercel.app - All Rights Reserved.
</div>
<script>
(() => {
    const copyrightElement = document.getElementById("copyright");
    copyrightElement.innerHTML = "&copy;  "+new Date().getFullYear()+" https://jaisons-blog.vercel.app - All Rights Reserved.";
})();
</script>
