<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiError, gradesApi, type Grade } from '$lib/api';

  let items = $state<Grade[]>([]);
  let loading = $state(true);
  let error = $state('');

  onMount(load);

  async function load() {
    loading = true;
    error = '';
    try {
      items = await gradesApi.list();
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement des notes';
    } finally {
      loading = false;
    }
  }

  function openItem(id: number) {
    goto(`/grades/${id}`);
  }
</script>

<div class="actions-row">
  <h1>Notes</h1>
  <a class="button" href="/grades/new">+ Ajouter</a>
</div>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p>Chargement…</p>
{:else if items.length === 0}
  <p>Aucune note pour le moment.</p>
{:else}
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Valeur</th>
        <th>Commentaire</th>
        <th>Devoir</th>
        <th>Élève</th>
      </tr>
    </thead>
    <tbody>
      {#each items as item (item.id)}
        <tr class="clickable" onclick={() => openItem(item.id)}>
          <td>{item.id}</td>
          <td>{item.value}</td>
          <td>{item.comment ?? ''}</td>
          <td>{item.assignment.title}</td>
          <td>{item.student.first_name} {item.student.last_name}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
