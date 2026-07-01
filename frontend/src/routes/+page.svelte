<script lang="ts">
  const sections = [
    { href: '/classes', label: 'Classes', description: 'Gérer les classes' },
    { href: '/subjects', label: 'Matières', description: 'Gérer les matières' },
    { href: '/lessons', label: 'Cours', description: 'Gérer les cours' },
    { href: '/assignments', label: 'Devoirs', description: 'Gérer les devoirs' },
    { href: '/grades', label: 'Notes', description: 'Gérer les notes' },
    { href: '/accounts', label: 'Comptes', description: 'Créer des comptes élève ou enseignant' },
  ];
</script>

<h1>note-it</h1>
<p>Choisis une section à gérer :</p>

<div class="actions-row" style="margin-top: 20px; flex-wrap: wrap; gap: 12px; justify-content: flex-start;">
  {#each sections as section (section.href)}
    <a class="button" href={section.href}>{section.label}</a>
  {/each}
</div>
