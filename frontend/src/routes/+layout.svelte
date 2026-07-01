<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';

  let { children } = $props();

  const links = [
    { href: '/classes', label: 'Classes' },
    { href: '/subjects', label: 'Matières' },
    { href: '/lessons', label: 'Cours' },
    { href: '/assignments', label: 'Devoirs' },
    { href: '/grades', label: 'Notes' },
    { href: '/accounts', label: 'Comptes' },
  ];
</script>

<nav class="topnav">
  <a class="brand" href="/">note-it</a>
  {#each links as link (link.href)}
    <a href={link.href} class:active={page.url.pathname.startsWith(link.href)}>
      {link.label}
    </a>
  {/each}
</nav>

<div class="container">
  {@render children()}
</div>
