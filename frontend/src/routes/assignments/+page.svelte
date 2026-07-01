<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiError, assignmentsApi, type Assignment } from '$lib/api';

  let items = $state<Assignment[]>([]);
  let loading = $state(true);
  let error = $state('');

  onMount(load);

  async function load() {
    loading = true;
    error = '';
    try {
      items = await assignmentsApi.list();
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement des devoirs';
    } finally {
      loading = false;
    }
  }

  function openItem(id: number) {
    goto(`/assignments/${id}`);
  }
</script>

<div class="actions-row">
  <h1>Devoirs</h1>
  <a class="button" href="/assignments/new">+ Ajouter</a>
</div>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p>Chargement…</p>
{:else if items.length === 0}
  <p>Aucun devoir pour le moment.</p>
{:else}
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Titre</th>
        <th>Barème</th>
        <th>Coefficient</th>
        <th>Début</th>
        <th>Fin</th>
      </tr>
    </thead>
    <tbody>
      {#each items as item (item.id)}
        <tr class="clickable" onclick={() => openItem(item.id)}>
          <td>{item.id}</td>
          <td>{item.title}</td>
          <td>{item.scale}</td>
          <td>{item.coefficient}</td>
          <td>{item.begin_date ? new Date(item.begin_date).toLocaleDateString() : ''}</td>
          <td>{item.end_date ? new Date(item.end_date).toLocaleDateString() : ''}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
